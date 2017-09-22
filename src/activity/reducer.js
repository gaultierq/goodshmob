// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as Api from "../utils/Api";
import * as Util from "../utils/ModelUtils";

const initialState = Immutable(Object.assign({all: {}}, createDefault(types.FETCH, types.LIKE)));

export default function reduce(state:any = initialState, action: any) {

    state = Api.handleAction(action, state, types.FETCH, types.LIKE);

    switch (action.type) {
        case types.APPEND_FETCHED_ACTIVITIES:

            let res = action.activities.reduce((map, obj) => {
                map[obj.id] = obj;
                return map;
            }, {});
            state = state.merge({all: res});
            break;
        case types.FETCH:
            let payload = action.payload;
            let data = Util.parse(payload);
            let id : string = data.id;
            let one = {};
            one[id] = data;
            state = state.merge({all: one});
            break;

    }
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
