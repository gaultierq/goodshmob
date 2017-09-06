'use strict';

import React, {Component} from 'react';

import {ActivityIndicatorIOS, StyleSheet, View} from 'react-native';
import LoginManager from "../managers/LoginManager"

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
                    onLoginFinished={this.onLoginFinished.bind(this)}
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
            this.performLogin();
        }
    }

    performLogin() {
        LoginManager.login(() => {
            this.props.navigator.push({
                screen: 'goodsh.MainScreen',
                title: 'Goodsh'
            });
        });
    }
}

const styles = StyleSheet.create({

});

export const Config = {
    label: 'Login',
    screen: 'goodsh.LoginScreen',
    icon: require('../img/profil.png'),
    //selectedIcon: require('../img/two_selected.png'), // iOS only
    navigatorStyle: {
        navBarHidden: true,
    }
};
