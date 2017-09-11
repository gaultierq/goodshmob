import * as Api from "../utils/Api"
import * as types from './activitiesTypes';
import * as Util from "../model/Util"

export function fetchActivities() {
    return async (dispatch, getState) => {

        Api.get("activities?include=user,resource,target")
            .then((activities) => {

                //list of activities
                //let activities2 = activities.data;
                let activities3 = Util.parse(activities);

                dispatch(setFetchedActivities({activities: activities3}));
                }
            )
            .done();
    };
}

export function setFetchedActivities({ activities }) {
    return {
        type: types.SET_FETCHED_ACTIVITIES,
        activities,
    }
}