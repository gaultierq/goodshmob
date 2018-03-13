
import {areNotEquals} from "../helpers/ArrayUtil";

export class UpdateTracker {

    refKeys;
    debugName: string;
    debugId: Id;

    constructor(makeRefObject: nextProps => Array, options: any = {}) {
        this.makeRefObject = makeRefObject;
        this.debugName = options.debugName;
        this.debugId = options.debugId;
    }

    onRender(props) {
        this.refKeys = this.makeRefObject(props);
        if (this.debugName) {
            console.debug(`${this.debugName} onRender`)
        }
    }

    shouldComponentUpdate(nextProps) {
        const array1 = this.refKeys;
        const array2 = this.makeRefObject(nextProps);
        const result = !array1 || !array2 || areNotEquals(array1, array2);
        if (this.debugName) {
            // console.debug(`${this.debugName} shouldComponentUpdate = ${result} ${this.debugId && result ? this.debugId : ""}`)
        }
        return __ENABLE_PERF_OPTIM__ || result;
    }
}