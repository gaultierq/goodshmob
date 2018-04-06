// @flow

import ApiAction from "./ApiAction";
import * as Api from "../managers/Api";
import {Call} from "../managers/Api";
import type {Id} from "../types";
import type {PendingItem} from "../reducers/dataReducer";
import {CREATE_PENDING_ACTION, REMOVE_PENDING_ACTION} from "../reducers/dataReducer";
/*

export function parse(data: any) {
    let createStore =  (store) => {

        if (data.included) {
            data.included.map((source) => {
                let obj: Base = createObject(source, store);
                if (obj) {
                    // $FlowFixMe
                    store[obj.type] = store[obj.type] || {};
                    // $FlowFixMe
                    store[obj.type][obj.id] = obj;
                }
            });
        }
        return store;
    };

    let store = createStore({});

    //this is a hack to avoid too much thinking
    //TODO: do the thinking
    store = createStore(store);

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

    //1. create flat object
    //2. fill relationship
    //3. flatten relationships

    //if the store is provided, and contains the element for type x id,
    //then this element will be used to popoulate the resulting object.

export function createObject(source: Source, store: any): Base {

    let result = createFlatObject(source);

    if (source.relationships) {
        let relResult = {};
        Object.getOwnPropertyNames(source.relationships).map((relKey)=>{
            let srcObj = source.relationships[relKey];
            if (!srcObj || !srcObj.data) return;

            //object vs array

            let objectFromStore = (src) => {
                let relObj: Base = createObject(src, store);

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
*/

export type MergeOptions<K> = {
    afterId:? K,
    beforeId:? K,

    //has more and has less are used to know if we should extends segment to remove to list boundaries
    hasMore:? boolean,
    hasLess:? boolean,
    reverse:? boolean
}


export function mergeLists<T, K>(mergeInto: Array<T>, mergeMe: Array<T>, options?: MergeOptions<K>) {
    let merge : Merge<T,K> = new Merge(mergeInto, mergeMe);

    merge.withOptions(options)
        .merge();
}

export class Merge<T, K> {

    mergeInto: Array<T>;

    mergeMe: Array<T>;

    afterId:? K;

    beforeId:? K;

    hasMore:? boolean;

    hasLess:? boolean;

    reverse:? boolean;

    keyAccessor:? T => K;

    itemMerger:? (T, T) => T;

    //determine if the merge did have an effect on the target array
    mutated = false;

    constructor(mergeInto: Array<T>, mergeMe: Array<T>) {
        this.mergeInto = mergeInto;
        this.mergeMe = mergeMe.slice();
    }

    setAfterKey(afterId: K): Merge<T, K> {
        this.afterId = afterId;
        return this;
    }

    //!\\ do *not* rely on DataList#hasMore
    hasMore(hasMore: boolean): Merge<T, K> {
        this.hasMore = hasMore;
        return this;
    }

    //!\\ do *not* rely on DataList#hasLess
    withHasLess(hasLess: boolean): Merge<T, K> {
        this.hasLess = hasLess;
        return this;
    }

    withKeyAccessor(accessor: any => any): Merge<T, K> {
        this.keyAccessor = accessor;
        return this;
    }

    withItemMerger(itemMerger: (T,T) => T): Merge<T, K> {
        this.itemMerger = itemMerger;
        return this;
    }

    withOptions(options?: MergeOptions<K>): Merge<T, K> {
        Object.assign(this, options || {});
        return this;
    }

    getSegment() {
        let mergeIds: Array<K> = this.getIds(this.mergeInto);
        let addIds: Array<K> = this.getIds(this.mergeMe);

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


    getIds(arr: Array<T>): Array<K> {
        return arr.map(e => this.getKey(e));
    }

    processOptions() {
        if (this.hasLess === false && this.mergeMe.length === 0) {
            // I think this make sense
            this.hasMore = false;
        }
    }

    merge(): void {

        this.processOptions();

        if (this.reverse) {
            this.afterId = this.beforeId;
            this.mergeInto.reverse();
        }

        //console.log(`merging ${JSON.stringify(this.mergeMe)} into ${JSON.stringify(this.mergeInto)}`);
        //(start, end)
        let segment = this.getSegment();
        if (segment) {
            console.debug(`merge: segment=${JSON.stringify(segment)}`);
        }


        let mergeIds : Array<K> = this.getIds(this.mergeInto);

        let resRemoved:? { [K]: T } = null;
        //merge=removing long segment, and adding the new items right after
        if (segment !== null) {
            resRemoved = {};
            //removing the segment
            for (let i = segment.to; i >= segment.from; i--) {
                let removed : T = this.mergeInto.splice(i, 1)[0];
                let key: K = this.getKey(removed);
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

        if (this.reverse) {
            this.mergeInto.reverse();
        }
        //onMerged();
    }

    //TODO: make 'idAccessor' mandatory, in constructor, name it keyAccessor, and rm d['id']
    getKey(d: T): K {
        // $FlowFixMe
        return this.keyAccessor ? this.keyAccessor(d) : d['id'];
    }


    mergeItem(oldItem: T, newItem: T): T {
        if (this.itemMerger) {
            const mergedItem = this.itemMerger(oldItem, newItem);
            if (mergedItem !== oldItem) {
                this.mutated = true;
            }

            return mergedItem;
        }
        return newItem;
    }
}

export function pendingActionWrapper<Payload>(
    action: ApiAction,
    callFactory: (payload: Payload) => Call
) : PendingAction<Payload>  {

    Api.registerCallFactory(action, callFactory);

    return {

        pending: (payload: Payload, options: any = {}) => (dispatch: any) => new Promise((resolve, reject) => {

                //let payload = payloadFactory();
                let pendingId = `pendingAction-${Math.random()}`;
                dispatch({
                    type: CREATE_PENDING_ACTION,
                    pendingActionType: action,
                    payload,
                    options,
                    pendingId,
                });
                resolve(pendingId);
            }
        ),
        call: callFactory,
        undo: (pendingId: Id) => (dispatch: any) => new Promise((resolve, reject) => {
            dispatch({
                type: REMOVE_PENDING_ACTION,
                pendingActionType: action,
                id: pendingId
            });
            resolve();
        }),
        exec: (payload: Payload) => callFactory(payload).disptachForAction2(action)
    };
}

export interface PendingAction<T> {

    pending: (payload: T, options: any) => (dispatch: any) => Promise<T>;

    call: (payload: T) => Call;

    undo: (pendingId: Id) => (dispatch: any) => Promise<T>;

    exec: (payload: T) => (dispatch: any) => Promise<T>;
}

export function mergeItemsAndPendings<T>(
    syncedItems: Array<T>,
    pendingCreate: [],
    pendingDelete: [],
    pendingToItem: (pending: PendingItem) => T,
    options: any = {}
) {

    let {afterI} = options;

    let items: Array<T> = [];

    let addPendingCreate = () => {
        _.forEach(pendingCreate, pending => {
            if (pending.state === 'pending' || pending.state === 'processing') {

                items.push(pendingToItem(pending));
            }
        })
    };


    //this is crap
    if (afterI == null) addPendingCreate();

    for (let i = 0;; i++) {


        let l = _.get(syncedItems, i);
        if (!l) break;

        //do not display items with pending deletion
        if (_.findIndex(pendingDelete, (o) => o.payload.lineupId === l.id) >= 0) continue;

        items.push(l);

        if (i === afterI) addPendingCreate();
    }
    return items;
}

