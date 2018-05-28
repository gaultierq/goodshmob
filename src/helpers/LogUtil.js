//@flow

export const logFormat = (level: GLoggerLevel) => {
    switch (level) {
        case "log": return 'color: #aaaaaa'
        case "debug": return 'color: #aaaaaa'
        case "info": return 'color: #0000ff'
        case "warning": return 'color: #ffa500'
        case "error": return 'color: #ff0000'
        default: return null
    }
}

export const logFilter = conf => (level, group) => {
    let confThreshold: GLoggerLevel
    if (conf && (confThreshold = conf[group])) {
        //return false <=> keep
        switch (level) {
            case 'error': if (confThreshold === 'error') return false
            case 'warn': if (confThreshold === 'warn') return false
            case 'info': if (confThreshold === 'info') return false
            case 'debug': if (confThreshold === 'debug') return false
            case 'log': if (confThreshold === 'log') return false
        }
        return true
    }
    return false
}
const levels = ['log', 'debug', 'info', 'warn', 'error'];

export function createLogger(parent: Logger, conf: GLoggerConfig): GLogger {

    const result: GLogger = {
        createLogger: function(conf: GLoggerConfig | string) {
            if (typeof conf === 'string') {
                conf = {group: conf}
            }
            return createLogger(this, conf)
        }
    }

    levels.forEach(level => {
        result[level] = (msg: string, ...args: any) => {
            let {group, groupName, format, filter} = conf
            if (filter && filter(level, group)) {
                return
            }

            const prefix = groupName !== undefined ? groupName : group + ' >';
            let message = `${prefix} ${msg}`
            if (format) {
                let styles = format(level)
                if (styles) {
                    message = `%c ${message}`
                    args.unshift(styles)
                }

            }
            parent[level].call(parent, message, ...args)
        }
    })
    return result
}
