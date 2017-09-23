// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'
import * as Api from "../utils/Api";
import {isUnique} from "../utils/ArrayUtil";

const initialState = Immutable({
    feed: {
        ids: []
    },
    load_feed: {requesting: false},
    load_more_feed: {requesting: false},
});

export default function reduce(state = initialState, action = {}) {

    let toMerge =
        new Api.Handler(action)
            .handle(types.LOAD_MORE_FEED, Api.REQUEST, Api.FAILURE)
            .handle(types.LOAD_FEED, Api.REQUEST, Api.FAILURE)
            .obtain();

    if (toMerge) {
        state = state.merge(toMerge, {deep: true})
    }

    let handle = function (apiAction) {
        let payload = action.payload;
        let activities = payload.activities;
        let currentFeedIds = state.feed.ids.asMutable()
            .map((id) => {
                return {id}
            });

        new DataUtils.Merge(currentFeedIds, activities)
            .withHasLess(true)
            .merge();

        let feedIds = currentFeedIds.map((a) => a.id);

        if (!isUnique(feedIds)) throw new Error(`duplicate found in ${JSON.stringify(feedIds)}`);

        let links = payload.links;
        state = state.merge({
            feed: {loaded: true},
            [apiAction.name()]: {requesting: false, error: null},
            links: links,
            hasMore: activities.length > 0 && links && links.next
        }, {deep: true});

        state = state.setIn(["feed", "ids"], feedIds);

        return state;
    };

    switch (action.type) {
        case types.LOAD_FEED.success():
            return handle(types.LOAD_FEED);
        case types.LOAD_MORE_FEED.success():
            return handle(types.LOAD_MORE_FEED);
        default:
            return state;
    }
}
