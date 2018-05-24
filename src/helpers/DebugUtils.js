//@flow


export function superLog(msg: string) {

    console.debug('%c ' + msg, 'background: #222; color: #bada55');

    // superConsole = {...console};
}

export function createConsole(displayName: string) {

    return {
        log: (message: string, ...others) => console.log(`[${displayName}]: ${message}`, ...others),
        debug: (message: string, ...others) => console.debug(`[${displayName}]: ${message}`, ...others),
        info: (message: string, ...others) => console.info(`[${displayName}]: ${message}`, ...others),
        warn: (message: string, ...others) => console.warn(`[${displayName}]: ${message}`, ...others),
    }
}



export const createLogger1 = (parent: GLogger) => (group: string) => createLoggerI(parent, {group})

export function createLoggerI(parent: any, conf: GLoggerConfig): GLogger {

    const result: GLogger = {}
    const levels = ['log', 'debug', 'info', 'warn', 'error'];
    levels.forEach(level => {
        result[level] = (msg: string, ...args: any) => {
            let {group, format} = conf
            let message = `${group}:${msg}`
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
    result.createLogger = createLogger1(result)
    return result
}


export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}