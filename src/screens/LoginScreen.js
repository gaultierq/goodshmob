'use strict';
// @flow
import React, {Component} from 'react';

import {Button, ImageBackground, Image, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
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


    state: {
        loginInProgress: boolean;
    };

    constructor(){
        super();
        this.state = {loginInProgress: false};
    }

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
                    } else {
                        console.log(`Login success with permissions: ${result.grantedPermissions ? result.grantedPermissions.toString() : 'null'}`);
                        this.props.dispatch(appActions.login(() => this.setState({loginInProgress: false})));
                    }

                },
                error => {
                    console.log('Login fail with error: ' + error)
                    this.setState({loginInProgress: false})
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