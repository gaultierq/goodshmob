import Immutable from 'seamless-immutable';
import * as types from "./actionTypes";
import {API_AUTH} from "../utils/Api";

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

export function authReducer(state = Immutable({}), action) {

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
    }
    return state;
}

export function deviceReducer(state = Immutable({}), action) {

    switch (action.type) {
        case types.SAVE_DEVICE.success():
            let currentDeviceId = action.payload.data.id;
            let attr = action.payload.data.attributes;
            let {fcmToken, ...attr2} = attr;
            let device = {currentDeviceId, fcmToken, ...attr2};
            state = state.merge(device);
            break;
    }
    return state;
}
