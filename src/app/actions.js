// @flow

import * as types from './actionTypes';
import LoginManager from "../managers/LoginManager";
import * as Persist from "../utils/Persist";
import * as Api from "../utils/Api";

import {
    setCustomText,
} from 'react-native-global-props';

export function appInitialized() {

    return async (dispatch: any, getState: any) => {
        // since all business logic should be inside redux actions
        // this is a good place to put your app initialization code


        //defining default font
        setCustomText({
            style: {
                fontFamily: 'Thonburi',
                color: 'black'
            }
        });

        let { user, access_token, client, uid} = (await Persist.readMany([
            "user",
            "access_token",
            "client",
            "uid",
        ]));

        Api.credentials(access_token, client, uid);

        dispatch(changeAppRoot(user));

    };
}

export function changeAppRoot(user) {
    return {type: user ? types.USER_LOGIN : types.USER_LOGOUT, user: user};
}

export function login(callback?:Function) {
    return async (dispatch: any, getState: any) => {
        // login logic would go here, and when it's done, we switch app roots

        //TODO: handle errors
        let user = await LoginManager.login();

        callback && callback();

        dispatch(changeAppRoot(user));
    };
}


export function logout() {

    return (dispatch: any, getState: any) => {

        LoginManager.logout();

        dispatch(changeAppRoot(null));
    };
}