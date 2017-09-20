// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"

const initialState = Immutable({
    activity: {}
});

export default function reduce(state:any = initialState, action: any) {
    switch (action.type) {
        case types.FETCH_REQUEST:
            return state.merge({
                loading: true
            });
        case types.FETCH_SUCCESS:
            let payload = action.payload;
            console.log("!!!!!!!!!!action="+action);

            let data = Util.parse(payload);

            return state.merge({
                data: data,
                loading: false,
                error: null
            });
        case types.FETCH_FAILURE:

            let error = action.payload;
            console.error(error);

            return state.merge({
                loading: false,
                error: error
            });
        default:
            return state;
    }
}
