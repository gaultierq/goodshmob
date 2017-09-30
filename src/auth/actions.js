// @flow

import * as Api from "../utils/Api";
import * as authTypes from "./actionTypes"
import {  LoginManager as FacebookLoginManager, AccessToken } from "react-native-fbsdk";

import {setCustomText} from 'react-native-global-props';

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
    };
}

export function login(dispatch: any, callback?:Function) {
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