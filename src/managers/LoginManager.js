// @flow

import {buildPersistentKey} from "../utils/Persist";
import * as Api from "../utils/Api";

import {  LoginManager as FacebookLoginManager, AccessToken } from "react-native-fbsdk";
import {AsyncStorage} from "react-native";
import * as Persist from "../utils/Persist";



class LoginManager {

    static user;

    static login() {
        return new Promise(resolve => {
            AccessToken.getCurrentAccessToken().then(
                (data) => {
                    let token = data ? data.accessToken.toString() : '';

                    console.info("facebook token:" + token);

                    Api.submit("https://goodshitapp-staging.herokuapp.com/auth/facebook/generate_token", 'POST', {auth: {access_token: token}})
                        .then((response) => {
                            let client = response.headers.get('Client');
                            let uid = response.headers.get('Uid');
                            let accessToken = response.headers.get('Access-Token');

                            console.log(`auth headers found: client=${client}, uid=${uid}, access-token=${accessToken} `);

                            Api.credentials(client, uid, accessToken);

                            AsyncStorage.multiSet([
                                [buildPersistentKey(Persist.CLIENT_KEY), client],
                                [buildPersistentKey(Persist.UID_KEY), uid],
                                [buildPersistentKey(Persist.ACCESS_TOKEN_KEY), accessToken],
                            ], () => {

                            });

                            return response
                        })
                        .then((response) => response.json())
                        .then((json) => {

                                let u = json.data;
                                let user = JSON.stringify(u);
                                console.info(`storing user: user=${user}`);

                                AsyncStorage.setItem(buildPersistentKey(Persist.USER_KEY), user);

                                this.user = u;

                                resolve();
                            }
                        )
                        .catch(() => this.logout())
                        .done();
                }
            )
        })
    }

    static logout() {
        FacebookLoginManager.logOut();
        //store("user", null);
        AsyncStorage.removeItem(buildPersistentKey("user"));
        this.user = null;
    }

    static currentUser() {
        console.log("current user = " + JSON.stringify(this.user))
        return this.user;
    }


}



export default LoginManager;