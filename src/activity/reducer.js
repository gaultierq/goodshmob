// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"

const initialState = Immutable({
    fetching: false,
    error: null
});

export default function reduce(state:any = initialState, action: any) {
    switch (action.type) {
        case types.FETCH_REQUEST:
            return state.merge({
                fetching: true
            });
        case types.FETCH_SUCCESS:
            let payload = action.payload;
            let data = Util.parse(payload);

            return state.merge({
                data: data,
                fetching: false,
                error: null
            });
        case types.FETCH_FAILURE:

            let error = action.payload;
            console.error(error);

            return state.merge({
                fetching: false,
                error: error
            });
        default:
            return state;
    }
}
