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
import {Colors} from "../colors"

import Swiper from 'react-native-swiper'
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "../fonts"

import i18n from '../../i18n'
import * as Api from "../../managers/Api"
import {renderSimpleButton} from "../UIStyles"
import type {RequestState, RNNNavigator, User} from "../../types"
import HTMLView from "react-native-htmlview"
import GTouchable from "../GTouchable"

type Props = {
    initialIndex: number,
    navigator: RNNNavigator
};

type State = {
    index: number,
    reqLoginFb?: RequestState,
    reqLoginAk?: RequestState,
};

const BUTTON_BACK = {
    id: 'back2',
    icon: require('../../img2/backArrowWhite.png'),
}
const BUTTON_SKIP = {
    id: 'skip',
    title: i18n.t("login_screen.button_skip"),
    buttonColor: 'white',
    buttonFontSize: 20,
}

const SLIDE_N = 4

@connect()
class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {index: props.initialIndex || 0};

        props.navigator.addOnNavigatorEvent(event => {
            console.debug("event", event)
            if (event.id === 'back2') {
                this.back()
            }
            if (event.id === 'skip') {
                this.last()
            }

        });
    }

    render() {
        let marg = 40;

        const contentHtmlStyles = StyleSheet.create({

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
        })
        const headerHtmlStyles = StyleSheet.create({

            div: {
                fontFamily: SFP_TEXT_REGULAR,
                fontSize: 30,
                // lineHeight: 38,
                color: Colors.white,
                textAlign:'center',
            },
            bold: {
                fontSize: 35,
                fontFamily: SFP_TEXT_BOLD,
            },
            black: {
                color: Colors.black,
            },
        })

        let ratio = .32

        const Header = props =>  (<View style={{
            backgroundColor: Colors.green,
            width: '100%',
            height: `${ratio * 100}%`,
            paddingTop: 50,
            // alignItems: 'center',
            justifyContent: 'center'
        }}>
            {props.children}
        </View>)
        const Content = props =>  (<View style={[{
            width: '100%', height: `${(1-ratio) * 100}%`,
            paddingHorizontal: '10%',
            paddingVertical: 20,
            // justifyContent: 'space-between',
        }, props.style]}>
            {props.children}
        </View>)


        const NextButton = props =>  (
            <GTouchable style={{
                backgroundColor: Colors.green,
                width: '100%',
                alignSelf: 'flex-end',
                alignItems: 'center',
                borderRadius: 4,
                paddingVertical: 12,


                textShadowColor: 'rgba(0, 0, 0, 1)',
                textShadowOffset: {width: -1, height: 1},
                textShadowRadius: 3,

            }} onPress={this.next.bind(this)}
            >

                <Text style={{
                    fontSize: 24,
                    fontFamily: SFP_TEXT_BOLD,
                    color: Colors.white,

                }}>{props.label}</Text>
            </GTouchable>
        )

        return (
            <View style={{
                flex: 1,
                backgroundColor: Colors.green

            }}>
                <Swiper
                    ref="homeSwiper"
                    loop={false}
                    index={this.state.index}
                    onIndexChanged={async (index) => {
                        await this.setState({index})
                        console.debug('login: index change, nex index=', index)
                        this.refreshNavigator()
                    }}
                    showsPagination={false}
                >
                    {/*slide 1*/}
                    <ImageBackground
                        source={require('../../img2/slider_background_0.jpg')}
                        style={{width: '100%', height: '100%',}}>
                        <Header>
                            <Image style={[styles.image]} source={require("../../img2/logoWhite.png")}/>
                        </Header>

                        <Content style={{justifyContent: 'space-between',}}>
                            <HTMLView value={`<div>${i18n.t("login_screen.slider_intro_1")}</div>`} stylesheet={contentHtmlStyles}/>
                            <NextButton label={i18n.t("login_screen.button_start")} />
                        </Content>
                    </ImageBackground>
                    {/*slide 2*/}
                    <ImageBackground
                        source={require('../../img2/slider_background_1.jpg')}
                        style={{width: '100%', height: '100%',}}>
                        <Header>
                            <HTMLView value={`<div>${i18n.t("login_screen.slider_intro_2")}</div>`} stylesheet={headerHtmlStyles}/>
                        </Header>
                        <Content style={{justifyContent: 'flex-end',}}>
                            <NextButton label={i18n.t("login_screen.button_next")} />
                        </Content>
                    </ImageBackground>
                    {/*slide 3*/}
                    <ImageBackground
                        source={require('../../img2/slider_background_2.jpg')}
                        style={{width: '100%', height: '100%',}}>
                        <Header>
                            <HTMLView value={`<div>${i18n.t("login_screen.slider_intro_3")}</div>`} stylesheet={headerHtmlStyles}/>
                        </Header>

                        <Content style={{justifyContent: 'flex-end',}}>
                            <NextButton label={i18n.t("login_screen.button_next")} />
                        </Content>
                    </ImageBackground>
                    {/*slide 4*/}
                    <ImageBackground
                        source={require('../../img2/slider_background_3.jpg')}
                        style={{width: '100%', height: '100%',}}>
                        <Header>
                            <HTMLView value={`<div>${i18n.t("login_screen.slider_intro_4")}</div>`} stylesheet={headerHtmlStyles}/>
                        </Header>

                        <Content style={{justifyContent: 'space-between',}}>
                            <HTMLView value={`<div>${i18n.t("login_screen.slider_intro_4_bis")}</div>`} stylesheet={contentHtmlStyles}/>
                            <NextButton label={i18n.t("login_screen.button_next")} />
                        </Content>
                    </ImageBackground>
                    {/*slide 5*/}
                    <View style={[styles.slide, {backgroundColor: Colors.white}]}>
                        <View style={[styles.desc]}>
                            <Image style={[styles.image, {marginBottom: marg}]} source={require("../../img2/logoBlack.png")}/>
                        </View>
                        <View style={{
                        }}>


                            <Text style={{fontSize: 10, color: '#ffffff', letterSpacing:1.2, textAlign: 'center', marginTop: 22, fontFamily: SFP_TEXT_BOLD}}>
                                {i18n.t('login_screen.no_publication')}
                            </Text>


                            <Button
                                isLoading={this.isSending(['reqLoginFb'])}
                                isDisabled={this.isSending()}
                                onPress={() => this.execLogin(false)}
                                style={[styles.facebookButton, ]}>
                                <Icon name="facebook" size={20} color="white" />
                                <Text style={styles.facebookButtonText}>
                                    {i18n.t('login_screen.facebook_signin')}
                                </Text>
                            </Button>

                            {
                                renderSimpleButton(
                                    i18n.t('login_screen.account_kit_signin'),
                                    () => this.execLogin(true),
                                    {
                                        loading: this.isSending(['reqLoginAk']),
                                        disabled: this.isSending(),
                                        textStyle: {fontSize: 12, letterSpacing:1.2, textAlign: 'center', marginTop: 22, fontFamily: SFP_TEXT_BOLD}
                                    }
                                )
                            }

                        </View>
                    </View>
                </Swiper>
            </View>
        )
    }

    refreshNavigator() {
        const i = this.state.index
        this.props.navigator.setButtons({
            leftButtons: i > 0 ? [BUTTON_BACK] : [],
            rightButtons: i < SLIDE_N && i > 0 ? [BUTTON_SKIP] : [],
        })
    }

    last() {
        this.refs["homeSwiper"].scrollBy(SLIDE_N - this.state.index, true);
    }

    next() {
        this.refs["homeSwiper"].scrollBy(1, true);
    }

    back() {
        this.refs["homeSwiper"].scrollBy(-1, true);
    }

    async handleFacebookLogin() {

        let result
        try {
            result = await LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends'])
        }
        catch (err) {
            console.warn('Login fail with error: ' + error);
            throw err
        }
        if (!result) throw 'Login result not found'
        if (result.isCancelled) throw 'Login cancelled'

        console.log(`Login success with permissions: ${result.grantedPermissions ? result.grantedPermissions.toString() : 'null'}`);

        let data = await AccessToken.getCurrentAccessToken()
        let token = data ? data.accessToken.toString() : '';

        if (Config.DEBUG_FACEBOOK_TOKEN) {
            console.info("debug facebook token will be used:" + token);
            token = Config.DEBUG_FACEBOOK_TOKEN;
        }
        console.info("facebook token:" + token);
        return await this.props.dispatch(appActions.loginWith('facebook', token))
    }

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

        const loginFunction = useAccountKit ? this.handleAccountKitLogin.bind(this) : this.handleFacebookLogin.bind(this)
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
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        alignSelf: 'center'
    },
    desc: {
        padding: "10%"
    },
});



