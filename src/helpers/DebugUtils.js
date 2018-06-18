//@flow



export function createConsole(displayName: string) {

    return {
        log: (message: string, ...others) => console.log(`[${displayName}]: ${message}`, ...others),
        debug: (message: string, ...others) => console.debug(`[${displayName}]: ${message}`, ...others),
        info: (message: string, ...others) => console.info(`[${displayName}]: ${message}`, ...others),
        warn: (message: string, ...others) => console.warn(`[${displayName}]: ${message}`, ...others),
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

export function hexToRgbaWithHalpha(hex:string, alpha: number) {
    const rgb = hexToRgb(hex)
    if (!rgb) return null
    let {r, g, b} = rgb
    return `rgba(${r},${g},${b},${alpha})`

}

