import * as Api from "../utils/Api"
import * as types from './activitiesTypes';

export function fetchActivities() {
    return async (dispatch, getState) => {

        Api.get("activities")
            .then((activities) => {
                    dispatch(setFetchedActivities({activities}));
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