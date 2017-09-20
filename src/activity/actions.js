// @flow

import { CALL_API } from 'redux-api-middleware'
import {API_END_POINT} from "../utils/Api";
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



export function fetchActivity(activityId, activityType, callback?) {
    let type = getType(activityType);

    return {
        [CALL_API]: {
            endpoint:  `${API_END_POINT}/${type}/${activityId}`,
            method: 'GET',
            headers: Api.headers(),
            types: [types.FETCH_REQUEST,
                types.FETCH_SUCCESS,
                // {
                //     type: types.FETCH_SUCCESS,
                //     payload: (action, state, res) => {
                //         const contentType = res.headers.get('Content-Type');
                //         if (contentType && ~contentType.indexOf('json')) {
                //             return res.json();
                //         }
                //     }
                // },
                types.FETCH_FAILURE]
        }
    }
}




