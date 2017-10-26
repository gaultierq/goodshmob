'use strict';
// @flow
import React, {Component} from 'react';

import {Button, ImageBackground, Image, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import * as appActions from "../auth/actions"
import {connect} from 'react-redux';
import {LoginManager} from 'react-native-fbsdk';
import i18n from '../i18n/i18n'
import { AccessToken } from "react-native-fbsdk";

type Props = {
};

type State = {
    loginInProgress: boolean;
};

class Login extends Component<Props, State> {

    state = {loginInProgress: false};

    render() {
        return (
            <ImageBackground
                source={require('../img/welcome_screen.jpg')}
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                }}
            >
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '10%'
                }}
                >
                    <Text>{i18n.t('login_screen.value_proposal')}</Text>
                    <Text>{i18n.t('login_screen.definition.example')}</Text>
                    <Image source={require('../img/goodshit_beta.png')}/>
                    <Button
                        onPress={this.handleFacebookLogin.bind(this)}
                        title={i18n.t('login_screen.facebook_signin')}
                        color="#40e7bb"
                        accessibilityLabel={i18n.t('login_screen.facebook_signin')}
                        disabled={this.state.loginInProgress}
                    />
                    <ActivityIndicator
                        animating = {this.state.loginInProgress}
                        size = "small"
                    />
                    <Text>{i18n.t('login_screen.no_publication')}</Text>
                </View>
            </ImageBackground>
        );
    }

    handleFacebookLogin () {
        this.setState({loginInProgress: true});

        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends'])
            .then(
                result => {
                    if (result.isCancelled) {
                        console.log('Login cancelled')
                    }
                    else {
                        console.log(`Login success with permissions: ${result.grantedPermissions ? result.grantedPermissions.toString() : 'null'}`);

                        AccessToken.getCurrentAccessToken().then(
                            (data) => {
                                let token = data ? data.accessToken.toString() : '';

                                console.info("facebook token:" + token);
                                this.props
                                    .dispatch(appActions.login(token))
                                    .then(() => this.setState({loginInProgress: false}))

                            }
                        )
                    }

                },
                error => {
                    console.log('Login fail with error: ' + error);
                    this.setState({loginInProgress: false});
                }
            )
            ;
    }
}

let screen = connect()(Login);

export {screen};
