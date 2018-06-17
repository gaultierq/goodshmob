declare var i18n: any;
declare var _: any;
declare var __WITH_NOTIFICATIONS__: boolean

export type Logger = {
    log: (m: string, ...args) => void,
    debug: (m: string, ...args) => void,
    info: (m: string, ...args) => void,
    warn: (m: string, ...args) => void,
    error: (m: string, ...args) => void,
}
export type GLogger = Logger & {
    createLogger: (conf: GLoggerConfig | string) => GLogger
}

declare var rootlogger: GLogger;

export type GLoggerLevel = 'log'| 'debug'| 'info'| 'warn'| 'error'
export type GLoggerGroup = string
export type GLoggerStyle = string

type GLoggerConfig = {
    group: GLoggerGroup,
    groupName?: string,
    format?: GLoggerLevel => ?GLoggerStyle,

    //you can filter your message, and all your children messages
    //return true if you want NOT to display the log
    filter?: (GLoggerLevel, GLoggerGroup) => boolean,
}