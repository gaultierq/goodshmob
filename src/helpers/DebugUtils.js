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


export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}