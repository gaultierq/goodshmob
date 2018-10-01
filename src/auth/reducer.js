// @flow

import * as types from "./actionTypes"
import {CLEAR_CACHE, SET_CACHE_VERSION, SET_USER_NULL} from "./actionTypes"
import {camelize} from 'camelize-object-key'

export function createWithReducers(appReducers) {
    return (state, action) => {
        let emptyCache = (state) => {
            let result = {};
            result.auth = {...state.auth};
            result.app = {...state.app};
            //result.config = {cacheVersion: version};
            return result;
        };

        switch (action.type) {
            case SET_USER_NULL:
                state = undefined;
                break;
            case CLEAR_CACHE:
                state = emptyCache(state);
                break;
            case SET_CACHE_VERSION:
                state = {...state, app: {...state.app, cacheVersion: action.cacheVersion}}
                break;
        }

        return appReducers(state, action);
    }
}

export function authReducer(state = {}, action) {

    switch (action.type) {
        case types.USER_LOGIN.success():
            //TODO: api return built object
            let currentUserId = action.payload.data.id;
            let resp = action.original;

            let client = resp.headers.get('Client');
            let uid = resp.headers.get('Uid');
            let accessToken = resp.headers.get('Access-Token');
            let now = new Date();
            state = {...state, client, uid, accessToken, currentUserId, loggedAt: now};
            break;
        case types.FETCH_ME.success():
            let algoliaToken = _.get(action.payload, "meta.key", null);
            state = {...state, algoliaToken};
            break;
        case types.USER_LOGOUT.success():
            state = {};
            break;
    }
    return state;
}

export function deviceReducer(state = {}, action) {

    switch (action.type) {
        case types.SAVE_DEVICE.success():
            let currentDeviceId = action.payload.data.id
            let attr = action.payload.data.attributes
            let {fcmToken, ...attr2} = attr
            let device = {currentDeviceId, fcmToken, ...attr2}
            device = camelize(device)
            state = {...state, ...device}
            break;
    }
    return state;
}
