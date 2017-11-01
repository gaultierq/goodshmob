// @flow
import build from '../../vendors/redux-object'
import type {Id} from "../types";
import * as _ from "lodash";
import * as Util from "./ModelUtils";
import dotprop from "dot-prop-immutable"

//ask backend to sanitize types
export let sanitizeActivityType = activityType => {
    switch (activityType.toLowerCase()) {
        case "post":
        case "posts":
            return "posts";
        case "sending":
        case "sendings":
            return "sendings";
        case "saving":
        case "savings":
            return "savings";
        case "creative-works":
        case "creative-work":
            return "creativeWorks";
        case "tv-shows":
        case "tv-show":
            return "tvShows";
        case "comments":
        case "comment":
            return "comments";
        case "places":
        case "place":
            return "places";
    }
    return activityType;
};

export function buildData(store, type, id: Id) {
    return buildNonNullData(store, type, id, false);
}


export function buildNonNullData(store, type, id: Id, assertNonNull?: boolean = true) {
    let result = build(store, type, id, {includeType: true});


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


export const dataStateToProps = (state, ownProps) => ({
    data: state.data,
});