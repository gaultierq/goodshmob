// @flow
import * as types from "./actionTypes"
import * as Api from "../utils/Api";
import {sanitizeActivityType} from "../utils/DataUtils";
import type {ActivityType, Id} from "../types";


export function fetchActivity(activityId: Id, activityType: ActivityType, options?:any = {}) {
    let type = sanitizeActivityType(activityType);

    let {include} = options;

    return new Api.Call()
        .withMethod('GET')
        .withRoute(`${type}/${activityId}`)
        .include(include)
        .disptachForAction2(types.FETCH_ACTIVITY,
            {id: activityId, type: activityType}
        );
}


export function like(activityId: string, activityType: string) {
    let type = sanitizeActivityType(activityType);

    return new Api.Call()
        .withMethod('POST')
        .withRoute(`${type}/${activityId}/likes`)
        .disptachForAction2(types.LIKE,
            {id: activityId, type: activityType}
        );
}

export function unlike(activityId: string, activityType: string) {
    let type = sanitizeActivityType(activityType);

    return new Api.Call()
        .withMethod('DELETE')
        .withRoute(`${type}/${activityId}/likes`)
        .disptachForAction2(types.UNLIKE,
            {id: activityId, type: activityType}
        );
}

export function unsave(savingId: Id, lineupId: Id) {
    return new Api.Call()
        .withMethod('DELETE')
        .withRoute(`savings/${savingId}`)
        .disptachForAction2(types.UNSAVE,
            {id: savingId, lineupId}
        );
}