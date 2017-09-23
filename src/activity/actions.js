// @flow
import * as types from "./actionTypes"
import * as Api from "../utils/Api";

let fixtures = require("../fixtures/activities_fixtures2.json");

let getType = function (activityType) {
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
    }
    if (!type) throw new Error(`type not found for ${activityType}`);
    return type;
};


export function fetchActivity(activityId, activityType) {
    let type = getType(activityType);
    return Api.createSimpleApiCall(`${type}/${activityId}`, 'GET', types.FETCH, {id: activityId});
}


export function like(activityId: string, activityType: string) {
    let type = getType(activityType);
    return Api.createSimpleApiCall(`${type}/${activityId}/likes`, 'POST', types.LIKE, {id: activityId});
}

export function unlike(activityId: string, activityType: string) {
    let type = getType(activityType);
    return Api.createSimpleApiCall(`${type}/${activityId}/likes`, 'DELETE', types.UNLIKE, {id: activityId});
}