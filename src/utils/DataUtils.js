import build from 'redux-object'
import type * as types from "../types";


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
    }
    //if (!type) throw new Error(`type not found for ${activityType}`);
    return type;
};

export function buildNonNullData(store, type, id: string) {
    let result = build(store, type, id);


    if (!result) {
        let sanitized = sanitizeActivityType(type);
        result = build(store, sanitized, id, {includeType: true});
        if (result) {
            console.warn(`data sanitize success:${type} -> ${sanitized}`)
        }
    }

    if (!result) throw new Error(`resource not found for type=${type} id=${id}`);
    return result;
}

export function assertUnique(data: Array) {
    let ids = [];
    data && data.forEach((d) => {
        if (ids.indexOf(d.id)>=0) throw new Error(`id already in this array: ${d.id}`);
        ids.push(d.id);
    });
}

