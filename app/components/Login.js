'use strict';

import React, {Component} from 'react';

import {ActivityIndicatorIOS, StyleSheet, View} from 'react-native';
import Persist from "../utils/Persist";

const FBSDK = require('react-native-fbsdk');
const {
    LoginButton, AccessToken
} = FBSDK;

function prepareCall(verb, token) {
    verb = verb || "auth/facebook/generate_token";
    let apiEndpoint = "https://goodshitapp-staging.herokuapp.com/";
    return fetch(
        apiEndpoint + verb,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({auth: {access_token: token}})
        });
}

export default class Login extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <View>
                <LoginButton
                    onLoginFinished={this.onLoginFinished}
                    onLogoutFinished={() => alert("logout.")}/>
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

                    console.log("facebook token:" + token)
                    prepareCall("auth/facebook/generate_token", token)
                        .then((response) => {
                            let client = response.headers.get('Client');
                            let uid = response.headers.get('Uid');
                            let accessToken = response.headers.get('Access-Token');

                            console.log(`headers: client=${client}, uid=${uid}, access-token=${accessToken} `);

                            Persist.store("client", client, "uid", uid, "access-token", accessToken);

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