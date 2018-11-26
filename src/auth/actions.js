// @flow

import * as Api from "../managers/Api"
import * as actionTypes from "./actionTypes"
import {SET_USER_NULL} from "./actionTypes"
import {LoginManager as FacebookLoginManager} from "react-native-fbsdk"
import type {Device} from "../types"
import {ImageCacheManager} from 'react-native-cached-image'
import CookieManager from 'react-native-cookies';


export function logoutOffline(dispatch) {
    try {
        const imageCacheManager = ImageCacheManager()
        imageCacheManager.clearCache().catch(e => console.error("send notification to bugsnag", e))
    }
    finally {
        FacebookLoginManager.logOut()
        __APP__.cachePurge()
        dispatch({type: SET_USER_NULL})
    }
    CookieManager.clearAll()
}



//if user lost auth, then offline logout
export function logout(dispatch) {
    return dispatch(
        new Api.Call()
            .withMethod('POST')
            .withRoute(`logout`)
            .createActionDispatchee(actionTypes.USER_LOGOUT)
    ).catch(err  => console.error(err))
        .then(()=> {
                logoutOffline(dispatch);
            }
        )
}

export function loginWith(service: 'facebook'|'account_kit', token: string) {
    const call = new Api.Call()
    return call
        .withMethod('POST')
        .withRoute(`auth/${service}/generate_token`)
        .withBody({auth: {access_token: token}})
        .createActionDispatchee(actionTypes.USER_LOGIN);
}

export function saveDevice(device: Device) {
    return new Api.Call()
        .withMethod('POST')
        .withRoute(`devices`)
        .withBody({...device})
        .createActionDispatchee(actionTypes.SAVE_DEVICE);
}

export function me() {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`me`)
        .createActionDispatchee(actionTypes.FETCH_ME);
}
