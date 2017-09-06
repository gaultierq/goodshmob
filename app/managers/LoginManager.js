import {buildPersistentKey, store, store3} from "../utils/Persist";
import {  prepareCall } from "../utils/Api";

import {  LoginManager as FacebookLoginManager, AccessToken } from "react-native-fbsdk";
import {AsyncStorage} from "react-native";


class LoginManager {

    static user;

    static login(callback) {

        AccessToken.getCurrentAccessToken().then(
            (data) => {
                let token = data.accessToken.toString();

                console.log("facebook token:" + token);
                prepareCall("auth/facebook/generate_token", token)
                    .then((response) => {
                        let client = response.headers.get('Client');
                        let uid = response.headers.get('Uid');
                        let accessToken = response.headers.get('Access-Token');

                        console.log(`headers: client=${client}, uid=${uid}, access-token=${accessToken} `);

                        store3("client", client, "uid", uid, "access-token", accessToken);

                        return response
                    })
                    .then((response) => response.json())
                    .then((json) => {

                        let u = json.data;
                        let user = JSON.stringify(u);
                            console.log(`storing user: user=${user}`);

                            AsyncStorage.setItem(buildPersistentKey("user"), user, () => this.readUser());

                            this.user = u;

                            callback && callback();
                        }
                    )
                    .done();
            }
        )
    }

    static logout(cb) {
        FacebookLoginManager.logOut();
        //store("user", null);
        AsyncStorage.removeItem(buildPersistentKey("user"));
        this.user = null;
        cb && cb();
    }

    static currentUser() {
        console.log("current user = " + JSON.stringify(this.user))
        return this.user;
    }

    static readUser() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem(buildPersistentKey("user")).then((u) => {
                console.log("user stored: " + u);
                LoginManager.user = JSON.parse(u);
                resolve(u);
            });
        });

    }


}



export default LoginManager;