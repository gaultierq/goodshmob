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
    index: number
};

@connect()
class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {index: props.initialIndex || 0};
    }

    render() {
        let marg = 40;
        let transformBase = 100;

        return (
            <Swiper
                style={styles.wrapper}
                loop={false}
                index={this.props.initialIndex}
                // dotStyle={{backgroundColor: dotColor, width: 5, height: 5,borderRadius: 2.5, margin: 12}}
                // activeDotStyle={{backgroundColor: dotColor, width: 8, height: 8, borderRadius: 4, margin: 12}}
                renderPagination={(index, total, context) => this.renderPagination(index, total, context)}
                onIndexChanged={(index)=>this.setState({index})}
            >

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
        )
    }


    getColorsByIndex() {
        let dotColor;
        let loveColor;
        let eiffel;
        const white = '#ffffff';
        switch (this.state.index) {
            case 0:
                dotColor = 'transparent';
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

    renderPagination = (index, total, context) => {
        // By default, dots only show when `total` >= 2
        if (total <= 1) return null;
        let {dotColor, eiffel, loveColor} = this.getColorsByIndex();

        const spacing = 6;
        let dotStyle = {backgroundColor: dotColor, width: 5, height: 5,borderRadius: 2.5, margin: spacing};
        let activeDotStyle = {backgroundColor: dotColor, width: 8, height: 8, borderRadius: 4, margin: spacing};

        let dots = [];
        const ActiveDot = <View style={[activeDotStyle]} />;
        const Dot = <View style={[dotStyle]} />;

        for (let i = 0; i < total; i++) {
            if (i === 0 || i === total-1)continue;
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
                    backgroundColor: 'transparent'
                }]}>
                    {dots}
                </View>

                <View style={[{flexDirection: 'row'}]}>
                    <Image style={{marginRight: 10}} source={eiffel}/>
                    <Text style={[{color: loveColor, fontFamily: SFP_TEXT_BOLD}]}>#Fait avec amour à Paris</Text>
                </View>

            </View>
        )
    }

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