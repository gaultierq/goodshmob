import Immutable from 'seamless-immutable';
import * as types from '../actions/activitiesTypes';

const initialState = Immutable({
});

export default function fetchActivities(state = initialState, action = {}) {
    switch (action.type) {
        case types.FETCH_ACTIVITIES:
            return state.merge({
                activities: action.activities
            });
        default:
            return state;
    }
}
