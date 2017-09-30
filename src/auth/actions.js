// @flow

import * as types from './actionTypes';
import * as Api from "../utils/Api";
import * as authTypes from "../auth/authActionTypes"
import {  LoginManager as FacebookLoginManager, AccessToken } from "react-native-fbsdk";

import {
    setCustomText,
} from 'react-native-global-props';
import * as ModelUtils from "../utils/ModelUtils";

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

        // let { user, access_token, client, uid} = (await Persist.readMany([
        //     "user",
        //     "access_token",
        //     "client",
        //     "uid",
        // ]));

        //Api.credentials(access_token, client, uid);

        //dispatch(dispatchLogin(user));

    };
}

export function dispatchLogin(user) {
    user = JSON.parse(user);
    return {type: user ? types.USER_LOGIN : types.USER_LOGOUT, user};
}

// export function login(callback?:Function) {
//     return async (dispatch: any, getState: any) => {
//         // login logic would go here, and when it's done, we switch app roots
//
//         //TODO: handle errors
//         let user = await LoginManager.login();
//
//         callback && callback();
//
//         dispatch(dispatchLogin(user));
//     };
// }

export function login(dispatch, callback?:Function) {
    AccessToken.getCurrentAccessToken().then(
        (data) => {
            let token = data ? data.accessToken.toString() : '';

            console.info("facebook token:" + token);

            dispatch(new Api.Call()
                .withMethod('POST')
                .withRoute(`auth/facebook/generate_token`)
                .withBody({auth: {access_token: token}})
                .disptachForAction(authTypes.USER_LOGIN));
        }
    )

}

export function logout() {
    FacebookLoginManager.logOut();
    return {type: authTypes.USER_LOGOUT};
}