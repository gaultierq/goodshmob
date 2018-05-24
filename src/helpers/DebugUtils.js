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




export const HELLO_CONSOLE1 = (group: string) => (msg, ...args) => {
    return [`${group}: ${msg}`, ...args]
}

export const createLogger = (parent: GLogger) => (group: string) => createConsole2(parent, HELLO_CONSOLE1(group))


export function createConsole2(parent: any, argsMut?: (msg: string, ...args: any) => []) {

    const result = {}
    const levels = ['log', 'debug', 'info', 'warn', 'error'];
    levels.forEach(level => {
        result[level] = (msg: string, ...args: any) => {

            const mutatedArgs = argsMut(msg, ...args);

            // const m = mutatedArgs.shift();

            const m = mutatedArgs.shift();
            if (mutatedArgs.length > 0) parent[level].call(parent, m, ...mutatedArgs)
            else parent[level].call(parent, m)
        }
    })
    result.createLogger = createLogger(result)
    return result


    // return {
    //     log: (message: string, ...others) => console.log(`[${displayName}]: ${message}`, ...others),
    //     debug: (message: string, ...others) => console.debug(`[${displayName}]: ${message}`, ...others),
    //     info: (message: string, ...others) => console.info(`[${displayName}]: ${message}`, ...others),
    //     warn: (message: string, ...others) => console.warn(`[${displayName}]: ${message}`, ...others),
    // }
}


export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}