// @flow
import * as types from "./actionTypes"
import * as Api from "../utils/Api";
import {sanitizeActivityType} from "../utils/DataUtils";


let fixtures = require("../fixtures/activities_fixtures2.json");


export function fetchActivityAndRelated(activityId, activityType) {
    let type = sanitizeActivityType(activityType);

    return new Api.Call()
        .withMethod('GET')
        .withRoute(`${type}/${activityId}`)
        .disptachForAction2(types.FETCH_ACTIVITY,
            {id: activityId, type: activityType}
        );
}


export function like(activityId: string, activityType: string) {
    let type = sanitizeActivityType(activityType);

    return new Api.Call()
        .withMethod('POST')
        .withRoute(`${type}/${activityId}/likes`)
        .disptachForAction(types.LIKE,
            {id: activityId, type: activityType}
        );
}

export function unlike(activityId: string, activityType: string) {
    let type = sanitizeActivityType(activityType);

    return new Api.Call()
        .withMethod('DELETE')
        .withRoute(`${type}/${activityId}/likes`)
        .disptachForAction(types.UNLIKE,
            {id: activityId, type: activityType}
        );
}