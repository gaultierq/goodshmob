'use strict';
// @flow
import React, {Component} from 'react';

import {ActivityIndicator, Button, Image, ImageBackground, StyleSheet, Text, View} from 'react-native';
import * as appActions from "../../auth/actions"
import {connect} from 'react-redux';
import {AccessToken, LoginManager} from 'react-native-fbsdk';

import SmartButton from "../components/SmartButton";
import {Colors} from "../colors";

import Swiper from 'react-native-swiper';
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM} from "../fonts";




type Props = {
    initialIndex: number
};

type State = {
    currentIndex: number
};

@connect()
class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {currentIndex: props.initialIndex || 0};
    }

    render() {
        let marg = 40;
        let transformBase = 100;
        return <Swiper style={styles.wrapper} loop={false} index={this.props.initialIndex}>
            <View style={[styles.slide, {backgroundColor: Colors.green}]}>
                <View style={[styles.desc, {}]}>
                    <Text style={[styles.text, {marginBottom: marg,color: "#ffffff"}]}>
                        #I was told it was great.{"\n"}
                        To not forget it{"\n"}
                        I have it goodshé.</Text>
                    <Image style={[styles.image]} source={require("../../img2/logoWhite.png")}/>
                    {/*todo: find a better way to obtain
                    1. goodsh centered
                    2. goodsh and text never overlapping
                    */}
                    <Text style={[styles.text, {marginTop: marg,opacity: 0}]}>
                        #I was told it was great.{"\n"}
                        To not forget it{"\n"}
                        I have it goodshé.</Text>
                </View>


                <Image style={[styles.path,  {right: 0, transform: [{translateY: transformBase}]}]} source={require("../../img2/path1.png")}/>
            </View>
            <View style={[styles.slide, {backgroundColor: "#ffffff"}]}>
                <View style={[styles.desc]}>
                    <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/paperPlane.png")}/>
                    <Text style={[styles.text, {color: Colors.green}]}>
                        #And it's so good I share it with my relatives.
                    </Text>
                    <Image style={[styles.image, {opacity:0, marginTop: marg}]} source={require("../../img2/paperPlane.png")}/>
                </View>
                <Image style={[styles.path, {width: '100%', transform: [{translateY: transformBase + 45}]}]} source={require("../../img2/Path2.png")}/>
            </View>
            <View style={[styles.slide, {backgroundColor: "#000000"}]}>
                <View style={[styles.desc]}>
                    <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/askIcon.png")}/>
                    <Text style={[styles.text, {color: "#ffffff"}]}>
                        #I ask questions, I with advice and suggestions.
                    </Text>
                    <Image style={[styles.image, {opacity:0, marginTop: marg}]} source={require("../../img2/askIcon.png")}/>
                </View>
                <Image style={[styles.path, {width: '100%', transform: [{translateY: transformBase+ 107}]}]} source={require("../../img2/Path3.png")}/>
            </View>
            <View style={[styles.slide, {backgroundColor: Colors.green}]}>
                <View style={[styles.desc]}>
                    <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/discoverIcon.png")}/>
                    <Text style={[styles.text, {color: "#ffffff"}]}>
                        #I discover books, movies, music, restaurants, gift ideas, stuff to do, to visit ...
                    </Text>
                    <Image style={[styles.image, {opacity:0, marginTop: marg}]} source={require("../../img2/discoverIcon.png")}/>
                </View>
                <Image style={[styles.path, {left: 0, transform: [{translateY: transformBase + 117}]}]} source={require("../../img2/Path4.png")}/>
            </View>
            {/*slide 5*/}
            <View style={[styles.slide, {backgroundColor: Colors.green}]}>
                <View style={[styles.desc]}>
                    <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/logoWhite.png")}/>
                </View>
                <View style={{
                }}>

                    <SmartButton
                        textKey={'login_screen.facebook_signin'}
                        execAction={this.handleFacebookLogin2}
                        style={[styles.facebookButton]}
                        textStyle={[styles.facebookButtonText]}
                        returnKeyType={'go'}
                    />

                    <Text style={{fontSize: 10, color: '#ffffff', letterSpacing:1.2, textAlign: 'center', marginTop: 22, fontFamily: SFP_TEXT_BOLD}}>
                        {i18n.t('login_screen.no_publication')}
                    </Text>

                </View>
            </View>
        </Swiper>
    }
    render1() {
        return (
            <ImageBackground
                source={require('../../img/welcome_screen.jpg')}
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
                            source={require('../../img2/headerLogoBlack.png')}
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
                            returnKeyType={'go'}
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
                                    }, err => reject(err))
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

let screen = Login;

export {screen};

const styles = StyleSheet.create({
    facebookButton: {
        backgroundColor: 'white',
        borderColor: Colors.green,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
    },
    facebookButtonText: {
        color: Colors.green,
        fontSize: 15
    },
    wrapper: {
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 23,
        fontFamily: SFP_TEXT_MEDIUM,
        textAlign: "center"
    },
    path: {
        position:'absolute',
    },
    image: {
        alignSelf: 'center'
    },
    desc: {
        padding: "10%"
    }

});