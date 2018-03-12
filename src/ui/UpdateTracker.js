
import {areEquals} from "../helpers/ArrayUtil";

export class UpdateTracker {

    refKeys;

    constructor(makeRefObject: nextProps => Array) {
        this.makeRefObject = makeRefObject;
    }

    onRender(props) {
        this.refKeys = this.makeRefObject(props);
    }

    shouldComponentUpdate(nextProps) {
        return __ENABLE_PERF_OPTIM__ || areEquals(this.refKeys, this.makeRefObject(nextProps));
    }
}