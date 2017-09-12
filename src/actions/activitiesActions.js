import * as Api from "../utils/Api"
import * as types from './activitiesTypes';
import * as Util from "../utils/ModelUtils"
let fixtures = require("../fixtures/activities_fixtures2.json");

export function fetchActivities() {
    return async (dispatch, getState) => {
        let result = Util.parse(fixtures);
        dispatch(setFetchedActivities({activities: result}));

        // Api.get("activities?include=user,resource,target")
        //     .then((response) => {
        //             let activities3 = Util.parse(response);
        //
        //             dispatch(setFetchedActivities({activities: activities3}));
        //         }
        //     )
        //     .done();
    };
}

export function setFetchedActivities({ activities }) {
    return {
        type: types.SET_FETCHED_ACTIVITIES,
        activities,
    }
}