// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'

const initialState = Immutable({
    feedIds: []
});

export default function fetchActivities(state = initialState, action = {}) {
    switch (action.type) {
        case types.APPEND_FETCHED_ACTIVITIES:

            //perfs ?
            let currentFeedIds = state.feedIds.asMutable().map((id) => {id});


            new DataUtils.Merge(currentFeedIds, action.activities)
                .withHasLess(true)
                .merge();

            let feedIds = currentFeedIds.map((a) => a.id);

            return state.merge({
                feedIds,
                links: action.links,
                hasMore: action.activities.length > 0 && action.links && action.links.next
            });
        default:
            return state;
    }
}
