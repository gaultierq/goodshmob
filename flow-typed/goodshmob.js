declare var i18n: any;
declare var _: any;

export type GLogger = {
    getGroup: () => string,
    createLogger: (group: string) => GLogger
}

declare var logger: GLogger;

export type GLoggerLevel = 'log'| 'debug'| 'info'| 'warn'| 'error'
export type GLoggerGroup = string
export type GLoggerStyle = string

type GLoggerConfig = {
    group: GLoggerGroup,
    format?: GLoggerLevel => ?GLoggerStyle
}