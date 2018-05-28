// @flow

import * as Api from "../managers/Api";
import * as actionTypes from "./actionTypes"
import {SET_USER_NULL} from "./actionTypes"
import {LoginManager as FacebookLoginManager} from "react-native-fbsdk";
import type {Device} from "../types";


export function logoutOffline(dispatch) {
    FacebookLoginManager.logOut();
    ImageCache.get().clear();
    dispatch({type: SET_USER_NULL});

}

//if user lost auth, then offline logout
export function logout(dispatch) {
    return dispatch(
        new Api.Call()
            .withMethod('POST')
            .withRoute(`logout`)
            .createActionDispatchee(actionTypes.USER_LOGOUT)
    ).then(()=> {
        logoutOffline(dispatch);
    }, err => {console.error(err)});
}

export function loginWith(service: 'facebook'|'account_kit', token: string) {
    return new Api.Call()
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
