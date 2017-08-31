'use strict';

import React, {Component} from 'react';

import {ActivityIndicatorIOS, StyleSheet, View} from 'react-native';
import {  store3 } from "../utils/Persist";
import {  prepareCall } from "../utils/Api";

const FBSDK = require('react-native-fbsdk');
const {
    LoginButton, AccessToken
} = FBSDK;


export default class Login extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <View>
                <LoginButton
                    onLoginFinished={this.onLoginFinished}
                />
            </View>
        );
    }

    onLoginFinished(error, result) {
        if (error) {
            alert("login has error: " + result.error);
        }
        else if (result.isCancelled) {
            alert("login is cancelled.");
        }
        else {
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

                                let user = JSON.stringify(json.data);
                                alert("json="+ user)
                                //AsyncStorage.set({"goodsh_store:current_user": user})
                            }
                        )
                        .done();
                }
            )
        }
    }
}

const styles = StyleSheet.create({

});