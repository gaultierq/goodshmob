// @flow

import * as Api from "../utils/Api";
import * as actionTypes from "./actionTypes"
import {LoginManager as FacebookLoginManager} from "react-native-fbsdk";
import type {Device} from "../types";

export function logout() {
    FacebookLoginManager.logOut();
    return {type: actionTypes.USER_LOGOUT};
}

export function login(token: string) {
    return new Api.Call()
        .withMethod('POST')
        .withRoute(`auth/facebook/generate_token`)
        .withBody({auth: {access_token: token}})
        .disptachForAction2(actionTypes.USER_LOGIN);
}

export function saveDevice({fcmToken}: Device) {
    return new Api.Call()
        .withMethod('POST')
        .withRoute(`devices`)
        .withBody({device: {token: fcmToken}})
        .disptachForAction2(actionTypes.SAVE_DEVICE);
}