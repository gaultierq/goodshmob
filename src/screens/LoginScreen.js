'use strict';

import React, {Component} from 'react';

import {ActivityIndicatorIOS, Button, Image, StyleSheet, Text, View} from 'react-native';
import * as appActions from "../actions/appActions"
import {connect} from 'react-redux';
import {LoginManager} from 'react-native-fbsdk';
import i18n from '../i18n/i18n'


// class UIColor
// def self.gs_green
// '#40e7bb'.to_color
// end
//
// def self.gs_blue
// '#408BE7'.to_color
// end
//
// def self.gs_separatorColor
// '#E5E5E5'.to_color
// end
//
// def self.gs_grayText
// '#BBBBBB'.to_color
// end
// end

class Login extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <Image
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
                    />
                    <Text>{i18n.t('login_screen.no_publication')}</Text>
                </View>
            </Image>
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
            //this.performLogin();
            this.props.dispatch(appActions.login());
        }
    }

    handleFacebookLogin () {
        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends'])
            .then(
                result => {
                    if (result.isCancelled) {
                        console.log('Login cancelled')
                    } else {
                        console.log('Login success with permissions: ' + result.grantedPermissions.toString());
                        this.props.dispatch(appActions.login());
                    }
                },
                error => {
                    console.log('Login fail with error: ' + error)
                }
            )
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


export default connect()(Login);