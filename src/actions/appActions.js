// @flow

import * as types from './appTypes';
import LoginManager from "../managers/LoginManager";
import * as Persist from "../utils/Persist";
import * as Api from "../utils/Api";

export function appInitialized() {

    return async (dispatch: any, getState: any) => {
        // since all business logic should be inside redux actions
        // this is a good place to put your app initialization code

        let { user, access_token, client, uid} = (await Persist.readMany([
            "user",
            "access_token",
            "client",
            "uid",
        ]));

        Api.credentials(access_token, client, uid);

        dispatch(changeAppRoot(user ? 'after-login' : 'login'));

    };
}

export function changeAppRoot(root: string) {
    return {type: types.ROOT_CHANGED, root: root};
}

export function login() {
    return async (dispatch: any, getState: any) => {
        // login logic would go here, and when it's done, we switch app roots

        //TODO: handle errors
        await LoginManager.login();

        dispatch(changeAppRoot('after-login'));
    };
}


export function logout() {

    return (dispatch: any, getState: any) => {

        LoginManager.logout();

        dispatch(changeAppRoot('login'));
    };
}