// now I can extend
//https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel
import ApiAction from "../helpers/ApiAction"

export class DebugFailConfig {

    globalConf: any //TYPEME
    confByAction = {}

    constructor(jsonObj) {
        this.globalConf = this.makeErr(jsonObj)
        _.forIn(jsonObj.actions, (value, key) => {
            this.confByAction[key] = this.makeErr(value)
        })

    }

    makeErr(obj) {
        let rate = _.get(obj, 'rate', 0)
        let err = _.get(obj, 'err', {httpCode: 511, message: 'Fake error message'})
        return {rate, err}
    }

    getFail(action: ApiAction) {
        let errConf = this.confByAction[action.name()] || this.globalConf
        return errConf && Math.random() < errConf.rate && this.thrown(errConf)

    }

    thrown(errConf) {
        return new FakeError(errConf.err.message, errConf.err.httpCode)
    }
}

class ExtendableError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = (new Error(message)).stack
        }
    }
}

class FakeError extends ExtendableError {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}
