import * as Api from "../utils/Api"
import * as types from './activitiesTypes';

export function fetchActivities() {
    return async (dispatch, getState) => {

        Api.get("activities")
            .then((response) => {
                    let json = response.json();
                    dispatch(setFetchedActivities({activities: json}));
                }
            )
            .done();
    };
}

export function setFetchedActivities({ activities }) {
    return {
        type: types.FETCH_ACTIVITIES,
        activities,
    }
}