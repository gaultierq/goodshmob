// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'
import * as Api from "../utils/Api";
import {isUnique} from "../utils/ArrayUtil";

const initialState = Immutable({
    //all: {},
    //ids: [],
    //load_friend: {requesting: false},
    //load_more_friend: {requesting: false},
});

export default function reduce(state = initialState, action = {}) {

    // let toMerge =
    //     new Api.Handler(action)
    //         .handle(types.LOAD_FRIENDS, Api.REQUEST, Api.FAILURE)
    //         .handle(types.LOAD_MORE_FRIENDS, Api.REQUEST, Api.FAILURE)
    //         .obtain();
    //
    // if (toMerge) {
    //     state = state.merge(toMerge, {deep: true})
    // }

    // let handle = function (apiAction) {
    //     let payload = action.payload;
    //     let friends = payload.data;
    //     let currentFriendIds = state.ids.asMutable()
    //         .map((id) => {
    //             return {id}
    //         });
    //
    //     new DataUtils.Merge(currentFriendIds, friends)
    //         .withHasLess(true)
    //         .merge();
    //
    //     let friendIds = currentFriendIds.map((a) => a.id);
    //
    //     let friendsById = friends.reduce((map, obj) => {
    //         map[obj.id] = obj;
    //         return map;
    //     }, {});
    //
    //     if (!isUnique(friendIds)) throw new Error(`duplicate found in ${JSON.stringify(friendIds)}`);
    //
    //     let links = payload.links;
    //     state = state.merge({
    //         feed: {loaded: true},
    //         [apiAction.name()]: {requesting: false, error: null},
    //         links: links,
    //         hasMore: friends.length > 0 && links && links.next,
    //         ids: friendIds,
    //         all: friendsById
    //     }, {deep: true});
    //
    //
    //     return state;
    // };

    // switch (action.type) {
    //     case types.LOAD_FRIENDS.success():
    //         return  state.merge(action.payload);
    //         //return handle(types.LOAD_FRIENDS);
    //     // case types.LOAD_MORE_FRIENDS.success():
    //     //     return handle(types.LOAD_MORE_FRIENDS);
    //     default:
    //         return state;
    // }
}
