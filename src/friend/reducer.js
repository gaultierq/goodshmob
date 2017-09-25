// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'
import * as Api from "../utils/Api";
import {isUnique} from "../utils/ArrayUtil";

const initialState = Immutable({
    list: [],
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
    //     let newFriends = payload.data;
    //     let currentFriends = state.ids.asMutable()
    //         .map((id) => {
    //             return {id}
    //         });
    //
    //     new DataUtils.Merge(currentFriends, newFriends)
    //         .withHasLess(true)
    //         .merge();
    //
    //     let friendIds = currentFriends.map((a) => a.id);
    //
    //     let friendsById = newFriends.reduce((map, obj) => {
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
    //         hasMore: newFriends.length > 0 && links && links.next,
    //         ids: friendIds,
    //         all: friendsById
    //     }, {deep: true});
    //
    //
    //     return state;
    // };



    switch (action.type) {
        case types.LOAD_FRIENDS.success():

            let currentFriends = state.list.asMutable();

            let payload = action.payload;
            let newFriends = payload.data.map((f)=> {
                let {id, type} = f;
                return {id, type};
            });


            new DataUtils.Merge(currentFriends, newFriends)
                .withHasLess(true)
                .merge();


            return state.merge({
                list: currentFriends,
            }, {deep: true});

        default:
            return state;
    }
}
