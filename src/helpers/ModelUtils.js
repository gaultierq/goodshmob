// @flow

import ApiAction from "./ApiAction"
import * as Api from "../managers/Api"
import {Call} from "../managers/Api"
import type {Id} from "../types"
import type {PendingItem} from "../reducers/dataReducer"
import {CREATE_PENDING_ACTION, REMOVE_PENDING_ACTION} from "../reducers/dataReducer"
import {createSelector} from "reselect"
import {buildData} from "./DataUtils"
import {CREATE_LINEUP, SAVE_ITEM} from "../ui/lineup/actionTypes"
import {UNSAVE} from "../ui/activity/actionTypes"
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
    afterId?: K,
    beforeId?: K,

    //has more and has less are used to know if we should extends segment to remove to list boundaries
    hasMore?: boolean,
    hasLess?: boolean,
    reverse?: boolean
}


export function mergeLists<T, K>(mergeInto: Array<T>, mergeMe: Array<T>, options?: MergeOptions<K>) {
    let merge : Merge<T,K> = new Merge(mergeInto, mergeMe);

    return merge.withOptions(options)
        .merge();
}

export class Merge<T, K> {

    target: Array<T>;

    source: Array<T>;

    afterId:? K;

    beforeId:? K;

    hasMore:? boolean;

    hasLess:? boolean;

    reverse:? boolean;

    keyAccessor:? T => K;

    itemMerger:? (T, T) => T;

    //determine if the merge did have an effect on the target array
    mutated = false;

    constructor(target: Array<T>, source: Array<T>) {
        this.target = target || []
        this.source = source ? source.slice() : []
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

    //TODO: rm ref to this.*
    getSegment() {
        let mergeIds: Array<K> = this.getIds(this.target);
        let addIds: Array<K> = this.getIds(this.source);

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
        if (this.hasMore === false) to = this.target.length - 1;

        if (from !== null && to !== null) return {from, to};
        return null;
    }


    getIds(arr: Array<T>): Array<K> {
        return arr.map(e => this.getKey(e));
    }

    processOptions() {
        if (this.hasLess === false && this.source.length === 0) {
            // I think this make sense
            this.hasMore = false;
        }
    }

    merge(): Array<T> {

        this.processOptions();

        let result = this.target.slice()

        if (this.reverse) {
            this.afterId = this.beforeId;
            result.reverse();
        }

        //console.log(`merging ${JSON.stringify(this.mergeMe)} into ${JSON.stringify(this.mergeInto)}`);
        //(start, end)
        let segment = this.getSegment();
        if (segment) {
            //this log is useless as it fires when the source and target are the same
            // console.debug(`merge: segment=${JSON.stringify(segment)}`);
        }


        let mergeIds : Array<K> = this.getIds(result);

        let resRemoved:? { [K]: T } = null;
        let resRemovedArr:? Array<T>;
        //merge=removing long segment, and adding the new items right after
        if (segment !== null) {
            resRemoved = {};
            //removing the segment
            for (let i = segment.to; i >= segment.from; i--) {
                let removed : T = result.splice(i, 1)[0];
                let key: K = this.getKey(removed);
                resRemoved[key] = removed;
                if (!resRemovedArr) resRemovedArr = [];
                resRemovedArr.unshift(removed);
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

        this.source.forEach(
            (d: T) => {

                if (resRemoved !== null) {
                    let old = resRemoved[this.getKey(d)];
                    if (old !== null) {
                        d = this.mergeItem(old, d);
                    }
                }

                result.splice(i++, 0, d);


                if (!resRemovedArr) {
                    console.debug("mutation: 2");
                    this.mutated = true;
                }
                else {
                    const shift = resRemovedArr.shift();
                    if (shift !== d) {
                        console.debug(`mutation: shifted=${JSON.stringify(shift)} result=${JSON.stringify(d)}` );
                        this.mutated = true;
                    }
                }


            });

        if (resRemovedArr && resRemovedArr.length > 0) {
            console.debug("mutation: items leftovers "+ JSON.stringify(resRemovedArr));
            this.mutated = true;
        }

        if (!this.mutated) {
            return this.target;
        }

        console.debug(`merge mutation: 
        target=${JSON.stringify(this.target)}\n
        source=${JSON.stringify(this.source)}\n
        result=${JSON.stringify(result)}\n
        `
        );

        if (this.reverse) result.reverse();


        //onMerged();
        return result;
    }

    //TODO: make 'idAccessor' mandatory, in constructor, name it keyAccessor, and rm d['id']
    getKey(d: T): K {
        let key = undefined;
        if (this.keyAccessor) key = this.keyAccessor(d);
        //shit
        if (key === undefined && (typeof d === 'string'||typeof d === 'number')) key = d;
        //shit
        if (key === undefined) key = d['id'];
        if (key === undefined) throw "NoKeyException";
        return key;
    }


    mergeItem(oldItem: T, newItem: T): T {
        if (this.itemMerger) {
            const mergedItem = this.itemMerger(oldItem, newItem);
            if (mergedItem !== oldItem) {
                this.mutated = true;
            }

            return mergedItem;
        }
        if (areEqualShallow(oldItem, newItem)) return oldItem;
        return newItem;
    }
}

// $FlowFixMe
function areEqualShallow(a, b) {
    if (typeof a === 'undefined' || typeof b === 'undefined') return a === b;
    for(var key in a) {
        if(!(key in b) || a[key] !== b[key]) {
            return false;
        }
    }
    for(var key in b) {
        if(!(key in a) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
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
        exec: (payload: Payload, options?: any) => callFactory(payload).createActionDispatchee(action, options)
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
    return  mergeItemsAndPendings2(
        syncedItems,
        pendingCreate,
        cand => _.findIndex(pendingDelete, (o) => o.payload.lineupId === cand.id) >= 0,
        pendingToItem,
        options)
}


export function mergeItemsAndPendings2<T>(
    syncedItems: Array<T>,
    pendingCreate: [],
    filterItem: T => boolean,
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

        if (filterItem && filterItem(l)) continue;

        items.push(l);

        if (i === afterI) addPendingCreate();
    }
    return items;
}

let lineupId = props => props.lineupId || _.get(props, 'lineup.id')
let userId = props => props.userId || _.get(props, 'user.id')

export const LINEUP_SECLECTOR = createSelector(
    [
        (state, props) => props.lineup,
        (state, props) => _.get(state, `data.lists.${lineupId(props)}`),
        (state, props) => _.head(state.pending[CREATE_LINEUP], pending => pending.id === lineupId(props)),
        state => state.data
    ],
    (
        propLineup, //lineup
        syncList, //lineup
        rawPendingList, //lineup
        data
    ) => {
        let lineup = (syncList && buildData(data, syncList.type, syncList.id) || {...rawPendingList, savings: []})
        if (syncList) {
            lineup = buildData(data, syncList.type, syncList.id)
        }
        else if (rawPendingList) {
            lineup = {id: rawPendingList.id, name: rawPendingList.payload.listName, savings: []}
        }
        else if (propLineup) {
            lineup = propLineup
        }
        return lineup
    }
)

export const USER_SECLECTOR = createSelector(
    [
        (state, props) => props.user,
        (state, props) => _.get(state, `data.users.${userId(props)}`),
        state => state.data
    ],
    (
        propUser,
        syncUser,
        data
    ) => {
        if (syncUser) return buildData(data, syncUser.type, syncUser.id)
        else if (propUser) return propUser
        return null
    }
)

export const LINEUP_AND_SAVING_SELECTOR = createSelector(
    [
        LINEUP_SECLECTOR,
        (state, props) => _.filter(state.pending[SAVE_ITEM], pending => pending.payload.lineupId === lineupId(props)),
        (state, props) => _.filter(state.pending[UNSAVE], pending => pending.payload.lineupId === lineupId(props)),
        state => state.data
    ],
    (
        lineup, //lineup
        rawPendingCreatedSavings,
        rawPendingDeletedSavings,
        data
    ) => {
        let savings
        if (lineup) {
            if (!_.isEmpty(rawPendingCreatedSavings)) {
                savings = rawPendingCreatedSavings.map(pending => {
                        const result = {
                            id: pending.id,
                            lineupId: pending.payload.lineupId,
                            itemId: pending.payload.itemId,
                            pending: true
                        }

                        // $FlowFixMe
                        Object.defineProperty(
                            result,
                            'resource',
                            {
                                get: () => {
                                    return buildData(data, pending.payload.itemType, pending.payload.itemId)
                                },
                            },
                        )
                        return result
                    }
                )
            }

            if (lineup.savings) {
                if (savings) savings = savings.concat(lineup.savings)
                else savings = [].concat(lineup.savings) //?
            }
            if (!_.isEmpty(rawPendingDeletedSavings)) {
                _.remove(savings, saving => rawPendingDeletedSavings.some(pending => pending.payload.savingId === saving.id))
            }

        }
        return {lineup, savings}
    }
)
