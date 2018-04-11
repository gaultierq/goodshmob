// @flow

import Immutable from 'seamless-immutable';
import * as types from "./actionTypes";
import {INIT_CACHE, SET_USER_NULL, UPGRADE_CACHE, CLEAR_CACHE} from "./actionTypes";
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
            // case INVALIDATE_CACHE:
            //     state = emptyCache(state, state.config.cacheVersion);
            //     break;
            case UPGRADE_CACHE:
            case INIT_CACHE:
            case CLEAR_CACHE:
                state = emptyCache(state);
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

export function deviceReducer(state = Immutable({}), action) {

    switch (action.type) {
        case types.SAVE_DEVICE.success():
            let currentDeviceId = action.payload.data.id;
            let attr = action.payload.data.attributes;
            let {fcmToken, ...attr2} = attr;
            let device = {currentDeviceId, fcmToken, ...attr2};
            device = camelize(device);
            state = state.merge(device);
            break;
    }
    return state;
}
