// @flow

import Base from "../models/Base";
import * as Models from "../models/index"
import * as StringUtils from "./StringUtils"

export function parse(data: any) {

    let store = {};

    if (data.included) {

        data.included.map((source) => {

            let obj: Base = this.createObject(source);
            if (obj) {
                // $FlowFixMe
                store[obj.type] = store[obj.type] || {};
                // $FlowFixMe
                store[obj.type][obj.id] = obj;
            }
        });
    }
    let data2 = data.data;
    if (data2 instanceof Array) {
        return data2.map((o) => createObject(o, store));
    }
    else {
        return createObject(data2, store)
    }
}

class ParseError extends Error {

}

let formatMsg = function (msg, type, source) {
    return `${msg} for type=${type}, and source=${source}`;
};

let thrown = function (msg, type, source) {
    throw new ParseError(formatMsg(msg, type, source));
};


let assignSafe = function (target, src) {
    for (let p in src) {
        if (src.hasOwnProperty(p)) {
            let pp = StringUtils.toLowercase(dashToCamel(p));
            // $FlowFixMe
            target[pp] = src[p];
        }
    }
};

let dashToCamel = function (type) {
    let uppercased = type.split('-').map((part) => {
        return StringUtils.toUppercase(part);
    });
    return uppercased.join('');
};

//2. flatten attributes
//type will be singular, CamelCased
function createFlatObject(source): Base {

    let type: string;
    //if (!source.id) throw new ParseError("expecting id");
    type = source.type;

    if (!type) {
        //console.error(formatMsg("expecting type", type, source));
        return null;
    }

    //console.debug(`creating object for type=${type}`);

    if (!type.endsWith("s")) thrown(`expecting plural`, type, source);

    //remove the plurals
    type = type.substr(0, type.length - 1);

    let moduleId: string = dashToCamel(type);

    //let moduleId = toUppercase(type);

    let clazz = Models[moduleId];
    if (!clazz) thrown(`model not found:${moduleId}`, type, source);

    let obj: Base = new clazz;

    obj.id = source.id;
    obj.type = moduleId;

    //let obj: Base = new Base();
    if (source.attributes) {
        assignSafe(obj, source.attributes);
    }
    if (source.meta) {
        obj.meta = source.meta;
    }


    return obj;
}

/*
    1. create flat object
    2. fill relationship
    3. flatten relationships

    if the store is provided, and contains the element for type x id,
    then this element will be used to popoulate the resulting object.
     */
export function createObject(source: Source, store: any): Base {

    let result = createFlatObject(source);

    if (source.relationships) {
        let relResult = {};
        Object.getOwnPropertyNames(source.relationships).map((relKey)=>{
            let srcObj = source.relationships[relKey];
            if (!srcObj || !srcObj.data) return;

            //object vs array

            let objectFromStore = (src) => {
                let relObj: Base = createFlatObject(src);

                //populate from store
                if (relObj) {
                    if (store && store[relObj.type]) {
                        let stored = store[relObj.type][relObj.id];
                        if (stored) {
                            Object.assign(relObj, stored);
                        }
                    }
                }
                return relObj;
            };

            let relObj = Array.isArray(srcObj.data) ?srcObj.data.map((a) => objectFromStore(a)) :  objectFromStore(srcObj.data);
            if (relObj) {
                relResult[relKey] = relObj;
            }
        });

        Object.assign(result, relResult);
    }



    return result;
}


export class Merge<T> {
    mergeInto: Array<T>;

    mergeMe: Array<T>;

    afterId: string;

    hasMore: boolean;

    hasLess: boolean;



    constructor(mergeInto: Array<T>, mergeMe: Array<T>) {
        this.mergeInto = mergeInto;
        this.mergeMe = mergeMe.slice();
    }

    setAfterKey(afterId: string): Merge<T> {
        this.afterId = afterId;
        return this;
    }

    //!\\ do *not* rely on DataList#hasMore
    hasMore(hasMore: boolean): Merge<T> {
        this.hasMore = hasMore;
        return this;
    }

    //!\\ do *not* rely on DataList#hasLess
    withHasLess(hasLess: boolean): Merge<T> {
        this.hasLess = hasLess;
        return this;
    }

    getSegment() {
        let mergeIds: Array<string> = this.getIds(this.mergeInto);
        let addIds: Array<string> = this.getIds(this.mergeMe);

        let from = null, to = null;
        addIds.forEach((id) => {
            let index = mergeIds.indexOf(id);
            let lastindex = mergeIds.lastIndexOf(id);

            if (index >= 0) {
                if (from === null) from = index;
                if (to === null) to = lastindex;

                if (index < from) from = index;
                if (lastindex > to) to = lastindex;
            }
        });

        if (this.hasLess === false) from = 0;
        if (this.hasMore === false) to = this.mergeInto.length - 1;

        if (from !== null && to !== null) return {from, to};
        return null;
    }


    getIds(arr: Array<T>): Array<string> {
        return arr.map(e => this.getKey(e));
    }

    merge() {
        //console.log(`merging ${JSON.stringify(this.mergeMe)} into ${JSON.stringify(this.mergeInto)}`);
        let result = [];

        //(start, end)
        let segment = this.getSegment();
        console.log(`segment= ${JSON.stringify(segment)}`);

        let mergeIds = this.getIds(this.mergeInto);

        let resRemoved: { [string]: T } = null;
        //merge=removing long segment, and adding the new items right after
        if (segment !== null) {
            resRemoved = {};
            //removing the segment
            for (let i = segment.to; i >= segment.from; i--) {
                let removed : T = this.mergeInto.splice(i, 1)[0];
                let key: string = this.getKey(removed);
                resRemoved[key] = removed;
                mergeIds.splice(mergeIds.indexOf(key), 1);
            }
        }
        //inserting:
        //a. right after afterId, if set
        //b. after the resRemoved segment
        //c. at the end of the list
        let insertAt = null;

        if (this.afterId !== null) {
            let ix = mergeIds.indexOf(this.afterId);
            if (ix >= 0) insertAt = ix + 1;
        }
        if (insertAt === null && segment !== null) insertAt = segment.from;
        if (insertAt === null) insertAt = mergeIds.length;

        let i = insertAt;
        this.mergeMe.forEach((d: T) => {
            if (resRemoved !== null) {
                let old = resRemoved[this.getKey(d)];
                if (old !== null) {
                    d = this.mergeItem(old, d);
                }
            }
            this.mergeInto.splice(i++, 0, d);
        });

        //onMerged();
        return result;
    }

    getKey(d: T): string {
        // $FlowFixMe
        return d['id'];
    }


    mergeItem(old: T, newItem: T): T {
        return newItem;
    }
}

