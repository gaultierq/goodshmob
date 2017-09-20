// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"

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
    return async (dispatch, getState) => {

        let type = getType(activityType);

        let call = new Api.Call().withRoute(`${type}/${activityId}`);

        call.get()
            .then((response) => {

                dispatch({
                    type: types.APPEND_FETCHED_ACTIVITIES,
                    activities: Util.parse(response),
                    links: response.links});
            })
            .catch((err) => {
                console.error(err);
            })
            .then(callback);


        // dispatch({
        //     type: types.APPEND_FETCHED_ACTIVITIES,
        //     activities: Util.parse(fixtures)
        //     });
    };
}




