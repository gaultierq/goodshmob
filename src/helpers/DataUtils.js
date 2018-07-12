// @flow
import build from '../../vendors/redux-object'
import type {Activity, Id, MergeOpts} from "../types"
import {mergeLists} from "./ModelUtils"
import dotprop from "dot-prop-immutable"
import {Statistics} from "../managers/Statistics"
import update from "immutability-helper"
import * as TimeUtils from "./TimeUtils"
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
        case "artist":
        case "artists":
            return "artists";
        case "list":
        case "lists":
            return "lists";
    }
    return activityType;
};

const ACTIVITY_TYPES = ['savings', 'sendings', 'posts', 'asks'];
export const isActivityType = (candidate: string) => {
    return ACTIVITY_TYPES.indexOf(candidate) >= 0;

};

export function buildData(store, type, id: Id) {
    let start = Date.now();
    // let result = build(store, type, id, {includeType: true});
    let sanitized = sanitizeActivityType(type);
    let result = build(store, sanitized, id, {includeType: true, decorator: item => decorate(item)});

    decorate(result)
    Statistics.recordTime(`buildData`, Date.now()-start);
    return result;
}

function decorate(object: ?any) {
    if (!object) return
    if (sanitizeActivityType(object.type) === 'lists' && object.primary === true) {
        object.name = i18n.t('lineups.goodsh.title')
    }
    object.built = 'true'
}

export function assertUnique(data: Array<*>) {
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

    return doDataMergeInState2(state, path, newList.map((c) => {
        let {id, type} = c;
        return {id, type};
    }), options);
    // let currentList = _.get(state, path, []);
    // currentList = currentList.slice();
    //
    // //3. merge state
    // //new Util.Merge(currentList, newItems).merge();
    // let merged = mergeLists(currentList, newItems, options);
    //
    // if (merged === currentList) return state;
    // console.log("doDataMergeInState: update");
    // return dotprop.set(state, path, merged);

}

export function doDataMergeInState2(state, path, newList, opt?: MergeOpts) {

    const {drop, ...options} = opt;
    if (drop) {
        console.debug("droping data");
        state = dotprop.set(state, path, []);
    }
    let currentList = _.get(state, path, []);
    currentList = currentList.slice();

    //3. merge state
    //new Util.Merge(currentList, newItems).merge();
    let merged = mergeLists(currentList, newList, options);

    if (merged === currentList) return state;
    console.log("doDataMergeInState: update");
    return dotprop.set(state, path, merged);

}


export function updateSplice0(state: any, path: string, opts: any) {
    const {deletePredicate, index, insert} = opts;

    let ix = index;
    let removeCount = 0;

    if (deletePredicate) {
        let indexToRemove =_.get(state, path, []).findIndex(deletePredicate);
        if (indexToRemove >= 0) {
            ix = indexToRemove;
            removeCount = 1;
        }
    }
    if (ix >= 0) {
        state = updateSplice3(state, path, ix, removeCount, insert);
    }
    return state;
}

export function updateSplice3(state: any, path: string, index: number, removeCount: number, itemToAdd: any) {
    if (index >= 0) {

        const args = [index, removeCount];
        if (itemToAdd) args.push(itemToAdd);
        let obj = _.set({}, path, {$splice: [args]});
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
export function isAsking(activity: Activity) {
    return activity && activity.type &&  sanitizeActivityType(activity.type) === 'asks';
}

export function timeSinceActivity(activity: Activity) {
    return activity ? TimeUtils.timeSince(Date.parse(activity.updatedAt || activity.createdAt)):'';
}

export function getAskBackgroundColor(activity: Activity) {
    const askColors = ['rgb(51,51,51)', Colors.pink, Colors.darkSkyBlue];
    return askColors[Date.parse(activity.createdAt) % askColors.length];
}
