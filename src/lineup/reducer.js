// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'
import * as Api from "../utils/Api";
import {isUnique} from "../utils/ArrayUtil";

const initialState = Immutable({
    all: {},
    ids: [],
    load_lineup: {requesting: false},
    load_more_lineup: {requesting: false},
});

export default function reduce(state = initialState, action = {}) {

    let toMerge =
        new Api.Handler(action)
            .handle(types.LOAD_LINEUPS, Api.REQUEST, Api.FAILURE)
            .handle(types.LOAD_MORE_LINEUPS, Api.REQUEST, Api.FAILURE)
            .obtain();

    if (toMerge) {
        state = state.merge(toMerge, {deep: true})
    }

    let handle = function (apiAction) {
        let payload = action.payload;
        let lineups = payload.data;
        let currentLineupIds = state.ids.asMutable()
            .map((id) => {
                return {id}
            });

        new DataUtils.Merge(currentLineupIds, lineups)
            .withHasLess(true)
            .merge();

        let lineupIds = currentLineupIds.map((a) => a.id);

        let lineupsById = lineups.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {});

        if (!isUnique(lineupIds)) throw new Error(`duplicate found in ${JSON.stringify(lineupIds)}`);

        let links = payload.links;
        state = state.merge({
            feed: {loaded: true},
            [apiAction.name()]: {requesting: false, error: null},
            links: links,
            hasMore: lineups.length > 0 && links && links.next,
            ids: lineupIds,
            all: lineupsById
        }, {deep: true});


        return state;
    };

    switch (action.type) {
        case types.LOAD_LINEUPS.success():
            return handle(types.LOAD_LINEUPS);
        case types.LOAD_MORE_LINEUPS.success():
            return handle(types.LOAD_MORE_LINEUPS);
        default:
            return state;
    }
}
