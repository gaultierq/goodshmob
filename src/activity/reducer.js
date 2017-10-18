// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import {sanitizeActivityType} from "../utils/DataUtils";

const initialState = Immutable();

export default function reduce(state:any = initialState, action: any) {
    switch (action.type) {
        case types.LIKE.success():
            break;
        case types.UNLIKE.success():{
            let {type, id} = action.options;
            type = sanitizeActivityType(type);

            state = Immutable.setIn(state, [type, id, "meta", "liked"], false);
            let newVar = [type, id, "meta", "likes-count"];

            let count = state.getIn(newVar);
            state = Immutable.setIn(state, newVar, --count);
            break;
        }
    }
    return state;
}
