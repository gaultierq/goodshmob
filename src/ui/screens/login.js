'use strict';
// @flow
import React, {Component} from 'react'

import {ActivityIndicator, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import * as appActions from "../../auth/actions"
import {connect} from 'react-redux'
import {AccessToken, LoginManager} from 'react-native-fbsdk'
import Config from 'react-native-config'
import RNAccountKit from 'react-native-facebook-account-kit'
import Button from 'apsl-react-native-button'
import Icon from 'react-native-vector-icons/FontAwesome'

import SwiperNav from "../components/SwiperNav"
import {Colors} from "../colors"

import Swiper from 'react-native-swiper'
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "../fonts"

import i18n from '../../i18n'
import * as Api from "../../managers/Api"
import {renderSimpleButton} from "../UIStyles"
import type {RequestState, User} from "../../types"
import HTMLView from "react-native-htmlview"
import GTouchable from "../GTouchable"

type Props = {
    initialIndex: number
};

type State = {
    index: number,
    reqLoginFb?: RequestState,
    reqLoginAk?: RequestState,
};

@connect()
class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {index: props.initialIndex || 0};
        this.goLastSwiperView = this.goLastSwiperView.bind(this);
    }



    render() {

        let marg = 40;
        let transformBase = 100;



        const htmlStyles = StyleSheet.create({

            div: {
                fontFamily: SFP_TEXT_REGULAR,
                fontSize: 38,
                lineHeight: 44,
                color: Colors.white,
                textAlign:'center',
                textShadowColor: 'rgba(0, 0, 0, 1)',
                textShadowOffset: {width: -1, height: 1},
                textShadowRadius: 8,

            },
            bold: {
                fontSize: 36,
                fontFamily: SFP_TEXT_BOLD,
            },
            black: {
                color: Colors.black,
            },
        })


        let ratio = .25
        return (
            <View style={styles.wrapper}>
                <Swiper
                    ref="homeSwiper"
                    loop={false}
                    index={this.props.initialIndex}

                    // dotStyle={{backgroundColor: dotColor, width: 5, height: 5,borderRadius: 2.5, margin: 12}}
                    // activeDotStyle={{backgroundColor: dotColor, width: 8, height: 8, borderRadius: 4, margin: 12}}
                    // renderPagination={(index, total, context) => this.renderPagination(index, total, context)}
                    onIndexChanged={(index)=>this.setState({index})}
                    showsPagination={false}
                >

                    <ImageBackground
                        source={require('../../img2/slider_background_0.png')}
                        style={
                            {
                                width: '100%',
                                height: '100%',
                            }
                        }
                    >
                        <View style={{
                            backgroundColor: Colors.green,
                            width: '100%', height: `${ratio * 100}%`,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image style={[styles.image]} source={require("../../img2/logoWhite.png")}/>
                        </View>
                        <View style={{width: '100%', height: `${(1-ratio) * 100}%`,
                            paddingHorizontal: '10%',
                            paddingVertical: 20,
                            justifyContent: 'space-between',
                        }}>

                            <HTMLView
                                value={`<div>${i18n.t("login_screen.slider_intro_1")}</div>`}
                                stylesheet={htmlStyles}
                                style={{
                                    // backgroundColor: 'red'
                                }}
                            />

                            <GTouchable style={{
                                backgroundColor: Colors.green,
                                width: '100%',
                                // height: 50,
                                // bottom: 20,
                                alignSelf: 'flex-end',
                                alignItems: 'center',
                                borderRadius: 4,
                                paddingVertical: 12,
                            }} onPress={()=>{
                                this.next()
                            }}>
                                <Text style={{
                                    fontSize: 26,
                                    fontFamily: SFP_TEXT_BOLD
                                }}>Commencer</Text>
                            </GTouchable>
                        </View>



                    </ImageBackground>


                    <View style={[styles.slide, {backgroundColor: "#ffffff"}]}>
                        <View style={[styles.desc]}>
                            <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/paperPlane.png")}/>
                            <Text style={[styles.text, {color: Colors.green}]}>
                                {i18n.t("login_screen.slider_intro_2")}
                            </Text>
                            <Image style={[styles.image, {opacity:0, marginTop: marg}]} source={require("../../img2/paperPlane.png")}/>
                        </View>
                        <Image style={[styles.path, {width: '100%', transform: [{translateY: transformBase + 45}]}]} source={require("../../img2/Path2.png")}/>
                    </View>
                    <View style={[styles.slide, {backgroundColor: "#000000"}]}>
                        <View style={[styles.desc]}>
                            <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/askIcon.png")}/>
                            <Text style={[styles.text, {color: "#ffffff"}]}>
                                {i18n.t("login_screen.slider_intro_3")}
                            </Text>
                            <Image style={[styles.image, {opacity:0, marginTop: marg}]} source={require("../../img2/askIcon.png")}/>
                        </View>
                        <Image style={[styles.path, {transform: [{translateY: transformBase+ 107}]}]} source={require("../../img2/Path3.png")}/>
                    </View>
                    <View style={[styles.slide, {backgroundColor: Colors.green}]}>
                        <View style={[styles.desc]}>
                            <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/discoverIcon.png")}/>
                            <Text style={[styles.text, {color: "#ffffff"}]}>
                                {i18n.t("login_screen.slider_intro_4")}
                            </Text>
                            <Image style={[styles.image, {opacity:0, marginTop: marg}]} source={require("../../img2/discoverIcon.png")}/>
                        </View>
                        <Image style={[styles.path, {left: 0, transform: [{translateY: transformBase + 117}]}]} source={require("../../img2/Path4.png")}/>
                    </View>
                    {/*slide 5*/}
                    <View style={[styles.slide, {backgroundColor: Colors.green}]}>
                        <View style={[styles.desc]}>
                            <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/logoBlack.png")}/>
                        </View>
                        <View style={{
                        }}>


                            <Button
                                isLoading={this.isSending(['reqLoginFb'])}
                                isDisabled={this.isSending()}
                                onPress={() => this.execLogin(false)}
                                style={styles.facebookButton}>
                                <Icon name="facebook" size={20} color="white" />
                                <Text style={styles.facebookButtonText}>
                                    {i18n.t('login_screen.facebook_signin')}
                                </Text>
                            </Button>



                            <Text style={{fontSize: 10, color: '#ffffff', letterSpacing:1.2, textAlign: 'center', marginTop: 22, fontFamily: SFP_TEXT_BOLD}}>
                                {i18n.t('login_screen.no_publication')}
                            </Text>

                            {
                                renderSimpleButton(
                                    i18n.t('login_screen.account_kit_signin'),
                                    () => this.execLogin(true),
                                    {
                                        loading: this.isSending(['reqLoginAk']),
                                        disabled: this.isSending(),
                                        style: {},
                                        textStyle: {fontSize: 12, color: '#ffffff', letterSpacing:1.2, textAlign: 'center', marginTop: 22, fontFamily: SFP_TEXT_BOLD}
                                    }
                                )
                            }

                        </View>
                    </View>
                </Swiper>
                <SwiperNav index={this.state.index} color={this.getColorsByIndex()} onPressSkip={this.goLastSwiperView}/>
            </View>
        )
    }



    goLastSwiperView() {
        const indexEnd = (this.state.index) ? (4 - this.state.index) : 4;
        this.refs["homeSwiper"].scrollBy(indexEnd, true);
    }

    next() {
        this.refs["homeSwiper"].scrollBy(this.state.index + 1, true);
    }


    getColorsByIndex() {
        let dotColor;
        let loveColor;
        let eiffel;
        const white = '#ffffff';
        switch (this.state.index) {
            case 0:
                dotColor = white;
                loveColor = white;
                eiffel = require("../../img2/eiffelWhite.png");
                break;
            case 1:
                dotColor = Colors.green;
                loveColor = Colors.green;
                eiffel = require("../../img2/eiffelGreen.png");
                break;
            case 2:
                dotColor = white;
                loveColor = white;
                eiffel = require("../../img2/eiffelWhite.png");
                break;
            case 3:
                dotColor = white;
                loveColor = white;
                eiffel = require("../../img2/eiffelWhite.png");
                break;
            case 4:
                dotColor = 'transparent';
                loveColor = white;
                eiffel = require("../../img2/eiffelWhite.png");
                break;
        }
        return {dotColor, loveColor, eiffel};
    }

    handleFacebookLogin = () => new Promise((resolve, reject)=> {

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
                                if (Config.DEBUG_FACEBOOK_TOKEN) {
                                    console.info("debug facebook token will be used:" + token);
                                    token = Config.DEBUG_FACEBOOK_TOKEN;
                                }

                                console.info("facebook token:" + token);
                                this.props
                                    .dispatch(appActions.loginWith('facebook', token))
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

    async handleAccountKitLogin(): Promise<User> {
        let token =  Config.DEBUG_ACCOUNT_KIT_TOKEN
        if (!token) {
            let data = await RNAccountKit.loginWithEmail()
            token = data && data.token;
        }
        if (token) {
            return await this.props.dispatch(appActions.loginWith('account_kit', token))
        }
        return null
    }

    execLogin(useAccountKit: boolean) {

        const loginFunction = useAccountKit ? this.handleAccountKitLogin.bind(this) : this.handleFacebookLogin
        if (this.isSending()) {
            console.debug("already executing action");
            return;
        }

        Api.safeExecBlock.call(
            this,
            loginFunction,
            useAccountKit ? 'reqLoginAk' : 'reqLoginFb'
        );
    }

    isSending(reqStat: Array<RequestState> = ['reqLoginAk', 'reqLoginFb']) {
        return reqStat.some(r => this.state[r] === 'sending')
    }

    renderPagination = (index, total, context) => {
        // By default, dots only show when `total` >= 2
        //if (total <= 1) return null;
        let {dotColor, eiffel, loveColor} = this.getColorsByIndex();

        const spacing = 6;
        let dotStyle = {backgroundColor: dotColor, width: 5, height: 5,borderRadius: 2.5, margin: spacing};
        let activeDotStyle = {backgroundColor: dotColor, width: 8, height: 8, borderRadius: 4, margin: spacing};

        let dots = [];
        const ActiveDot = <View style={[activeDotStyle]} />;
        const Dot = <View style={[dotStyle]} />;

        for (let i = 0; i < total; i++) {
            //if (i === 0 || i === total-1)continue;
            if (i === total-1)continue;
            dots.push(i === this.state.index
                ? React.cloneElement(ActiveDot, {key: i})
                : React.cloneElement(Dot, {key: i})
            )
        }

        return (
            <View pointerEvents='none' style={[{
                position: 'absolute',
                left: 0,
                right: 0,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }, {bottom: 50}]}>

                <View style={[{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    marginBottom: 20
                }]}>
                    {dots}
                </View>

                <View style={[{flexDirection: 'row'}]}>
                    <Image style={{marginRight: 10}} source={eiffel}/>
                    <Text style={[{color: loveColor, fontFamily: SFP_TEXT_BOLD}]}>{i18n.t("login_screen.credentials")}</Text>
                </View>

            </View>
        )
    }

}

let screen = Login;

export {screen};

const styles = StyleSheet.create({
    facebookButton: {
        backgroundColor: Colors.facebookBlue,
        borderColor: Colors.facebookBlue,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        paddingRight: 10,
        paddingLeft: 10
    },
    facebookButtonText: {
        color: Colors.white,
        fontWeight: "bold",
        fontSize: 15,
        marginLeft: 10,
    },
    wrapper: {
        flex: 1
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
    },
    button: {
        marginBottom: 0,
        marginLeft: 8,
        marginRight: 8,
        borderWidth: 0,
    },
    pagination_x: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    }

});



