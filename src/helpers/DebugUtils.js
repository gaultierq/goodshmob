//@flow


export function superLog(msg: string) {

    console.debug('%c ' + msg, 'background: #222; color: #bada55');

    // superConsole = {...console};
}

export function createConsole(displayName: string) {

    return {
        log: (message: string) => console.log(`[${displayName}]: ${message}`),
        debug: (message: string) => console.debug(`[${displayName}]: ${message}`),
        info: (message: string) => console.info(`[${displayName}]: ${message}`),
        warn: (message: string) => console.warn(`[${displayName}]: ${message}`),
    }
}

