//@flow

import type {GLogger, GLoggerConfig, LogObj} from "../flow-typed/goodshmob"
import Config from "react-native-config"

export const logFormat = (level: GLoggerLevel) => {
    if (__IS_ANDROID__) return null
    switch (level) {
        case "log": return 'color: #aaaaaa'
        case "debug": return 'color: #aaaaaa'
        case "info": return 'color: #0000ff'
        case "warn": return 'color: #ffa500'
        case "error": return 'color: #ff0000'
        default: return null
    }
}
const levels = ['log', 'debug', 'info', 'warn', 'error'];

export const logFilter = conf => (level, group) => {
    let confThreshold: GLoggerLevel = conf && conf[group]
    return levels.indexOf(level) < levels.indexOf(confThreshold)
}


class Printer implements GLogger {


    doLog(log: LogObj) {
        let {args, level, formats, groups} = log

        let message = _.first(args)
        if (_.isString(message)) {
            args = _.tail(args)
        }
        else {
            message = ''
        }

        let group = _.first(groups)
        if (group) {
            message = `${group} > ${message}`
        }


        let formatString
        if (!_.isEmpty(formats)) {
            message = `%c ${message}`
            formatString = _.first(formats) //formats.join(";")
            args.unshift(formatString)
        }
        console[level](message, ...args)
    }

    createLogger(c: GLoggerConfig | string) {
        throw "unexpected"
    }

}


class GLoggerImplem implements GLogger {

    parent: GLogger
    conf: GLoggerConfig

    constructor(options: {parent: GLogger, conf: GLoggerConfig}) {
        let {parent, conf} = options
        this.parent = parent
        this.conf = conf

        //init
        levels.forEach(level => {
            this[level] = (message, ...args) => {

                this.doLog({
                    args: [message, ...args],
                    level,
                    formats: [],
                    groups: [],
                })
            }
        })
    }

    //bubble up
    doLog(log: LogObj) {
        let {level} = log
        //check if filtered
        let {group, filter, format} = this.conf
        if (filter && filter(level, group)) return

        let f = format && format(level)
        if (f) log.formats.push(f)
        log.groups.push(group)


        this.parent.doLog(log)
    }

    createLogger(group: string) {
        let conf: GLoggerConfig = {group}
        let levelThreshold = getLevelThreshold(group)
        if (levelThreshold) {
            conf.filter = level => levels.indexOf(level) < levels.indexOf(levelThreshold)
        }


        return new GLoggerImplem({parent: this, conf})
    }
}

//use for init only
export function createLogger(conf: GLoggerConfig): GLogger {

    return new GLoggerImplem({parent: new Printer(), conf})
}

let getLevelThreshold = function (group) {
    let logConfig
    let lc = Config.LOG_CONFIG
    if (lc) {
        lc = lc.replace(new RegExp("'", 'g'), '"');
        try {
            logConfig = JSON.parse(lc)
        }
        catch (e) {
            console.error(e)
        }
    }
    return _.get(logConfig, group)
}
