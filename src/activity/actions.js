// @flow
import * as types from "./actionTypes"
import * as Api from "../utils/Api";
import {getType} from "../utils/DataUtils";

let fixtures = require("../fixtures/activities_fixtures2.json");


export function fetchActivity(activityId, activityType) {
    let type = getType(activityType);
    let call = new Api.Call()
        .withRoute(`${type}/${activityId}`);
    return Api.fetchData(types.FETCH_ACTIVITY, call);
}


export function like(activityId: string, activityType: string) {
    let type = getType(activityType);
    return Api.createSimpleApiCall(`${type}/${activityId}/likes`, 'POST', types.LIKE, {id: activityId});
}

export function unlike(activityId: string, activityType: string) {
    let type = getType(activityType);
    return Api.createSimpleApiCall(`${type}/${activityId}/likes`, 'DELETE', types.UNLIKE, {id: activityId});
}