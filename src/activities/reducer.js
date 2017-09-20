// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'

const initialState = Immutable({
    activities: []
});

export default function fetchActivities(state = initialState, action = {}) {
    switch (action.type) {
        case types.APPEND_FETCHED_ACTIVITIES:

            //perfs ?
            let activities = state.activities.asMutable();
            activities = activities.concat(action.activities);

            new DataUtils.Merge(activities, action.activities)
                .withHasLess(true)
                .merge();

            return state.merge({
                activities,
                links: action.links,
                hasMore: action.activities.length > 0 && action.links && action.links.next
            });
        default:
            return state;
    }
}
