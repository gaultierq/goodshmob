import build from 'redux-object'
import type {Id} from "../types";
import * as _ from "lodash";
import * as Util from "./ModelUtils";
import dotprop from "dot-prop-immutable"

//ask backend to sanitize types
export let sanitizeActivityType = function (activityType) {
    let type;
    switch (activityType.toLowerCase()) {
        case "post":
        case "posts":
            type = "posts";
            break;
        case "sending":
        case "sendings":
            type = "sendings";
            break;
        case "saving":
        case "savings":
            type = "savings";
            break;
        case "creative-works":
        case "creative-work":
            type = "creativeWorks";
            break;
        case "tv-shows":
        case "tv-show":
            type = "tvShows";
            break;
        case "comments":
        case "comment":
            type = "comments";
            break;
    }
    //if (!type) throw new Error(`type not found for ${activityType}`);
    return type;
};

export function buildData(store, type, id: Id) {
    return buildNonNullData(store, type, id, false);
}


export function buildNonNullData(store, type, id: Id, assertNonNull?: boolean = true) {
    let result = build(store, type, id);


    if (!result) {
        let sanitized = sanitizeActivityType(type);
        result = build(store, sanitized, id, {includeType: true});
        if (result) {
            console.warn(`data sanitize success:${type} -> ${sanitized}`)
        }
    }

    if (assertNonNull && !result) throw new Error(`resource not found for type=${type} id=${id}`);
    return result;
}

export function assertUnique(data: Array) {
    let ids = [];
    data && data.forEach((d) => {
        if (ids.indexOf(d.id)>=0) throw new Error(`id already in this array: ${d.id}`);
        ids.push(d.id);
    });
}


export function doDataMergeInState(state, path, newList) {
    let currentList = _.get(state, path, []).slice();

    let newItems = newList.map((c) => {
        let {id, type} = c;
        return {id, type};
    });

    //3. merge state
    new Util.Merge(currentList, newItems)
        .withHasLess(true)
        .merge();

    state = dotprop.set(state, path, currentList);
    return state;
}
