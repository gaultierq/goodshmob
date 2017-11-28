'use strict';
// @flow
import React, {Component} from 'react';

import {ActivityIndicator, Button, Image, ImageBackground, StyleSheet, Text, View} from 'react-native';
import * as appActions from "../auth/actions"
import {connect} from 'react-redux';
import {AccessToken, LoginManager} from 'react-native-fbsdk';

import SmartButton from "./components/SmartButton";
import {Colors} from "./UIStyles";

type Props = {
};

type State = {
};

class Login extends Component<Props, State> {

    state = {};

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
                    justifyContent: 'space-around',
                    margin: '10%'
                }}
                >
                    <View style={{
                        alignItems: 'center',
                    }}>
                        <Text style={{fontSize: 20, textAlign: 'center'}}>{i18n.t('login_screen.value_proposal')}</Text>
                        {/*<Text>{i18n.t('login_screen.definition.example')}</Text>*/}
                        <Image
                            source={require('../img/screen_title_home.png')}
                            resizeMode="contain"

                        />
                    </View>
                    <View style={{
                    }}>

                        <SmartButton
                            textKey={'login_screen.facebook_signin'}
                            execAction={this.handleFacebookLogin2}
                            style={[styles.facebookButton]}
                            textStyle={[styles.facebookButtonText]}
                        />

                        <Text style={{fontSize: 13, textAlign: 'center', marginTop: 22}}>
                            {i18n.t('login_screen.no_publication')}
                        </Text>

                    </View>
                </View>
            </ImageBackground>
        );
    }

    handleFacebookLogin2 = () => new Promise((resolve, reject)=> {

        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends'])
            .then(
                result => {
                    if (result.isCancelled) {
                        //console.log('Login cancelled');
                        reject('Login cancelled');
                    }
                    else {
                        console.log(`Login success with permissions: ${result.grantedPermissions ? result.grantedPermissions.toString() : 'null'}`);

                        AccessToken.getCurrentAccessToken().then(
                            (data) => {
                                let token = data ? data.accessToken.toString() : '';

                                console.info("facebook token:" + token);
                                this.props
                                    .dispatch(appActions.login(token))
                                    .then((user) => {
                                        resolve();
                                    })
                            }
                        )
                    }

                },
                error => {
                    console.log('Login fail with error: ' + error);
                    reject('Login fail with error: ' + error);
                }
            )
        ;
    });

}

let screen = connect()(Login);

export {screen};

const styles = StyleSheet.create({
    facebookButton: {
        backgroundColor: 'white',
        borderColor: Colors.green,
        borderWidth: 1,
        borderRadius: 8,
    },
    facebookButtonText: {
        color: Colors.green,
        fontSize: 15
    },
});