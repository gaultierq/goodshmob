// @flow

import * as Api from "../utils/Api";
import * as actionTypes from "./actionTypes"
import {  LoginManager as FacebookLoginManager} from "react-native-fbsdk";
import {setCustomText} from 'react-native-global-props';

export function onAppReady() {
    //defining default font
    setCustomText({
        style: {
            fontFamily: 'Thonburi',
            color: 'black'
        }
    });

    return {type: "APP_INITIALIZED"}
}

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