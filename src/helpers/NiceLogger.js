//@flow

import type {GLogger} from "../../flow-typed/goodshmob"

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

    factory: LogFactory
    parent: GLogger
    conf: GLoggerConfig

    constructor(factory: LogFactory, parent: GLogger, conf: GLoggerConfig) {
        this.factory = factory
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
        return this.factory.createLogger({group}, this)
    }
}

export class LogFactory {

    thresholds: {string?: GLoggerLevel}
    formats: {string?: string}

    constructor(conf: {thresholds: {string?: GLoggerLevel}, formats: {string?: string}}) {
        Object.assign(this, conf)
    }

    createLogger(conf: GLoggerConfig, parent?: GLogger) {
        //defaults
        conf = _.defaults(conf, {filter: this.makeFilter(conf.group)})
        conf = _.defaults(conf, {format: _.get(this.formats, conf.group)})
        if (!parent) parent = new Printer()

        return new GLoggerImplem(this, parent, conf)
    }

    makeFilter(group: string) {
        let levelThreshold = _.get(this.thresholds, group)
        return levelThreshold ? (level:GLoggerLevel) => levels.indexOf(level) < levels.indexOf(levelThreshold) : null
    }
}

type LogFactoryConf = {
    thresholds: {string?: GLoggerLevel},
    formats: {string?: string}
}

export default function createRootLogger(conf: LogFactoryConf, group: string = 'root') {
    return new LogFactory(conf).createLogger({group})
}
