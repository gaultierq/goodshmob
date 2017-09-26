// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as DataUtils from '../utils/ModelUtils'
import * as Api from "../utils/Api";
import {isUnique} from "../utils/ArrayUtil";

const initialState = Immutable({
    list: [],
    links: {},
    hasMore: false
});

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.LOAD_FEED.success():
        case types.LOAD_MORE_FEED.success():

            let currentList = state.list.asMutable();
            let links = {};

            let payload = action.payload;

            if (currentList.length === 0 || action.type === types.LOAD_MORE_FEED.success()) {
                links.next = payload.links.next;
            }

            let newList = payload.data.map((f)=> {
                let {id, type} = f;
                return {id, type};
            });

            new DataUtils.Merge(currentList, newList)
                .withHasLess(true)
                .merge();


            return state.merge({
                list: currentList,
                links,
                hasMore: newList.length > 0 && links && links.next
            }, {deep: true});

        default:
            return state;
    }
}
