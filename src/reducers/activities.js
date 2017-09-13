// @flow

import Immutable from 'seamless-immutable';
import * as types from '../actions/activitiesTypes';

const initialState = Immutable({
    activities: []
});

export default function fetchActivities(state = initialState, action = {}) {
    switch (action.type) {
        case types.APPEND_FETCHED_ACTIVITIES:

            return state.merge({
                activities: state.activities.concat(action.activities),
                links: action.links,
                hasMore: action.activities.length > 0 && action.links && action.links.next
            });
        default:
            return state;
    }
}
