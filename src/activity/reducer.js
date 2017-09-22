// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as Api from "../utils/Api";

const initialState = Immutable(createDefault(types.FETCH, types.LIKE));

export default function reduce(state:any = initialState, action: any) {

    let newState = Api.handleAction(action, state, types.FETCH, types.LIKE);
    if (newState) return newState;

    return state;
}

function createDefault(...actions) {
    let result = {};
    for (let action of actions) {
        result[action] = {
            requesting: false,
            error: null
        };
    }

    return result;
}
