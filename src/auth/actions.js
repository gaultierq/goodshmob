// @flow

import * as Api from "../utils/Api";
import * as actionTypes from "./actionTypes"
import {LoginManager as FacebookLoginManager} from "react-native-fbsdk";
import type {Device} from "../types";

export function logoutOffline() {
    FacebookLoginManager.logOut();
}

//if user lost auth, then offline logout
export function logout(dispatch) {
    return dispatch(
        new Api.Call()
            .withMethod('POST')
            .withRoute(`logout`)
            .disptachForAction2(actionTypes.USER_LOGOUT)
    ).then(()=> {
        logoutOffline();
    }, err => {console.error(err)});
}

export function login(token: string) {
    return new Api.Call()
        .withMethod('POST')
        .withRoute(`auth/facebook/generate_token`)
        .withBody({auth: {access_token: token}})
        .disptachForAction2(actionTypes.USER_LOGIN);
}

export function saveDevice(device: Device) {
    return new Api.Call()
        .withMethod('POST')
        .withRoute(`devices`)
        .withBody({...device})
        .disptachForAction2(actionTypes.SAVE_DEVICE);
}

export function me() {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`me`)
        .disptachForAction2(actionTypes.FETCH_ME);
}