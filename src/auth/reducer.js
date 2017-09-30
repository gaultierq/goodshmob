import * as types from './actionTypes';
import Immutable from 'seamless-immutable';

const initialState = Immutable({});


export function createWithReducers(appReducers) {
    return (state, action) => {
        switch (action.type) {
            case types.USER_LOGOUT:
                state = undefined;
                break;
        }

        return appReducers(state, action);
    }
}

export default function reduce(state = initialState, action) {
    switch (action.type) {
        case types.USER_LOGIN:
            return state.merge({currentUser: action.user});
        default:
            return state;
    }
}