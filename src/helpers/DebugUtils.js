//@flow


import type {Logger} from "../../flow-typed/goodshmob"

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

export function createCounter(logger: Logger, batchTimeMs: number = 5000): (path: string) => void {
    let logRet = {}
    let to = null
    return (path: string) => {
        _.set(logRet, path, _.get(logRet, path, 0) + 1)
        if (!to) {
            to = setTimeout(() => {
                logger.debug("counter: ", logRet)
                to = null
                logRet = {}
            }, batchTimeMs)
        }
    }
}
