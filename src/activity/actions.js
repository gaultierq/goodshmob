// @flow
import * as types from "./actionTypes"
import * as Api from "../utils/Api";
import {getType} from "../utils/DataUtils";

let fixtures = require("../fixtures/activities_fixtures2.json");


export function fetchActivity(activityId, activityType) {
    let type = getType(activityType);

    return new Api.Call()
        .withMethod('GET')
        .withRoute(`${type}/${activityId}`)
        .disptachForAction(types.FETCH_ACTIVITY);
}


export function like(activityId: string, activityType: string) {
    let type = getType(activityType);

    return new Api.Call()
        .withMethod('POST')
        .withRoute(`${type}/${activityId}/likes`)
        .disptachForAction(types.LIKE);
}

export function unlike(activityId: string, activityType: string) {
    let type = getType(activityType);

    return new Api.Call()
        .withMethod('DELETE')
        .withRoute(`${type}/${activityId}/likes`)
        .disptachForAction(types.UNLIKE);
}