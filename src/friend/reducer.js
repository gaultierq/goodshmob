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
