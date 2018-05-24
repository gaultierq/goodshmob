declare var i18n: any;
declare var _: any;

export type GLogger = {
    getGroup: () => string,
    createLogger: (group: string) => GLogger
}

declare var logger: GLogger;
