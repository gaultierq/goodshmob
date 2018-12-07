declare var i18n: any;
declare var _: any;
declare var __WITH_NOTIFICATIONS__: boolean
declare var __IS_IOS__: boolean
declare var __IS_ANDROID__: boolean
declare var __APP__: GoodshApp
declare var rootlogger: GLogger;

export type Logger = {
    log: (m: string, ...args) => void,
    debug: (m: string, ...args) => void,
    info: (m: string, ...args) => void,
    warn: (m: string, ...args) => void,
    error: (m: string, ...args) => void,
}


export type LogObj = {
    args: Array<*>,
    level: GLoggerLevel,
    formats: Array<string>,
    groups: Array<string>,
}

export type GLogger = Logger & {
    createLogger: (conf: GLoggerConfig | string) => GLogger,
    doLog: (log: LogObj) => void,
}



export type GLoggerLevel = 'log'| 'debug'| 'info'| 'warn'| 'error'
export type GLoggerGroup = string
export type GLoggerStyle = string

export type GLoggerConfig = {
    group: GLoggerGroup,

    format?: GLoggerLevel => ?GLoggerStyle,
    filter?: GLoggerLevel => boolean,
}
