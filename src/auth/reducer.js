import Immutable from 'seamless-immutable';
import * as types from "./actionTypes";
import {API_AUTH} from "../utils/Api";

const initialState = Immutable({
    currentUserId: '',
    client: '',
    uid: '',
    accessToken: ''

});

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

export default function (state = initialState, action) {

    switch (action.type) {
        case types.USER_LOGIN.success():
            //TODO: api return built object
            let currentUserId = action.payload.data.id;
            let resp = action.original;

            let client = resp.headers.get('Client');
            let uid = resp.headers.get('Uid');
            let accessToken = resp.headers.get('Access-Token');

            state = state.merge({client, uid, accessToken, currentUserId});
            break;
        case types.USER_LOGOUT:
            state = initialState;
            break;
    }
    return state;
}
