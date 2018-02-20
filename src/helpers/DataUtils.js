// @flow
import build from '../../vendors/redux-object'
import type {Activity, Id, MergeOpts} from "../types";
import {mergeLists} from "./ModelUtils";
import dotprop from "dot-prop-immutable"
import {Statistics} from "../managers/Statistics"
import update from "immutability-helper";
import * as TimeUtils from "./TimeUtils";
import {Colors} from "../ui/colors"

//ask backend to sanitize types
export let sanitizeActivityType = activityType => {

    switch ((activityType||"").toLowerCase()) {
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
        case "creativeworks":
        case "creativework":
            return "creativeWorks";
        case "tv-shows":
        case "tv-show":
        case "tvshows":
        case "tvshow":
            return "tvShows";
        case "comments":
        case "comment":
            return "comments";
        case "movies":
        case "movie":
            return "movies";
        case "places":
        case "place":
            return "places";
        case "likes":
        case "like":
            return "likes";
        case "ask":
        case "asks":
            return "asks";
        case "track":
        case "tracks":
            return "tracks";
        case "album":
        case "albums":
            return "albums";
    }
    return activityType;
};

const ACTIVITY_TYPES = ['savings', 'sendings', 'posts', 'asks'];
export const isActivityType = (candidate: string) => {
    return ACTIVITY_TYPES.indexOf(candidate) >= 0;

};

export function buildData(store, type, id: Id) {
    return buildNonNullData(store, type, id, false);
}


export function buildNonNullData(store, type, id: Id, assertNonNull?: boolean = true) {
    let start = Date.now();
    // let result = build(store, type, id, {includeType: true});
    let sanitized = sanitizeActivityType(type);
    let result = build(store, sanitized, id, {includeType: true});


    if (assertNonNull && !result && __WITH_ASSERTS__) throw new Error(`resource not found for type=${type} id=${id}`);
    //Statistics.record('build', Date.now()-start);
    Statistics.recordTime(`buildData`, Date.now()-start);
    return result;
}

export function assertUnique(data: Array<>) {
    let ids = [];
    data && data.forEach((d) => {
        if (ids.indexOf(d.id)>=0) {
            //throw new Error(`id already in this array: ${d.id}`);
            console.warn(`assertUnique: id already in this array: ${d.id}`);
        }
        ids.push(d.id);
    });
}


export function doDataMergeInState(state, path, newList, options?: MergeOpts) {
    let currentList = _.get(state, path, []);
    currentList = currentList.slice();

    let newItems = newList.map((c) => {
        let {id, type} = c;
        return {id, type};
    });

    //3. merge state
    //new Util.Merge(currentList, newItems).merge();
    mergeLists(currentList, newItems, options);

    let newState = dotprop.set(state, path, currentList);

    if (state === newState) throw "immutability violation";
    return newState;
}


export const dataStateToProps = (state, ownProps) => ({
    data: state.data,
});

export function updateDelete(state, path, predicate) {
    let data = _.get(state, path, []);
    let indexToRemove = data.findIndex(predicate);
    if (indexToRemove >= 0) {
        let obj = _.set({}, path, {$splice: [[indexToRemove, 1]]});
        state = update(state, obj);
    }
    return state;
}


export function isSaving(activity: Activity) {
    return activity && activity.type &&  sanitizeActivityType(activity.type) === 'savings';
}

export function isSending(activity: Activity) {
    return activity && activity.type &&  sanitizeActivityType(activity.type) === 'sendings';
}

export function timeSinceActivity(activity: Activity) {
    return activity ? TimeUtils.timeSince(Date.parse(activity.updatedAt || activity.createdAt)):'';
}

export function getAskBackgroundColor(activity: Activity) {
    const askColors = ['rgb(51,51,51)', Colors.pink, Colors.darkSkyBlue];
    return askColors[Date.parse(activity.createdAt) % askColors.length];
}
