import * as types from './types';
import LoginManager from "../../managers/LoginManager";

export function appInitialized() {

    return async function(dispatch, getState) {
        // since all business logic should be inside redux actions
        // this is a good place to put your app initialization code

        let user = await LoginManager.readUser();
        dispatch(changeAppRoot(user ? 'after-login' : 'login'));
    };
}

export function changeAppRoot(root) {
    return {type: types.ROOT_CHANGED, root: root};
}

export function login() {
    return async function(dispatch, getState) {
        // login logic would go here, and when it's done, we switch app roots

        //TODO: handle errors
        await LoginManager.login();

        dispatch(changeAppRoot('after-login'));
    };
}


export function logout() {

    return function(dispatch, getState) {

        LoginManager.logout();

        dispatch(changeAppRoot('login'));
    };
}