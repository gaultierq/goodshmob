'use strict';
// @flow

import React, {Component} from 'react';

import {
    ActivityIndicator,
    Button,
    Image,
    ImageBackground,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {connect} from 'react-redux';
import type {Id, RequestState} from "../types";
import {buildData} from "../utils/DataUtils";
import ApiAction from "../utils/ApiAction";
import * as Api from "../utils/Api";
import * as authActions from '../auth/actions'
import {currentUserId} from "../CurrentUser";

import * as UI from "./UIStyles";
import {renderLink, renderSimpleButton} from "./UIStyles";
import SmartInput from "./components/SmartInput";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-root-toast';
import {CONFIG_SET} from "../reducers/dataReducer";
import * as Nav from "./Nav";


type Props = {
    // userId: Id,
    data: any
};

type State = {
    //user?: User
    feedback?: string,
    reqLogout?: RequestState,
    devMenu?: boolean
};


@connect(state => ({
    data: state.data,
    config: state.config,
}))
export default class Profile extends Component<Props, State> {

    state = {user: null};


    componentWillMount() {
        // let {userId} = this.props;
        // if (!userId) throw "provide userId";

        let userId = currentUserId();

        if (!this.getUser(userId)) {
            this.props.dispatch(actions.getUser(userId).disptachForAction2(GET_USER)).then(({data})=>{
                //let user = this.getUser(userId);
                //this.setState({user});
            });
        }
    }


    renderVersion() {
        let handler = () => {

            if (!this.clicksMs) this.clicksMs = [];

            let now = Date.now();


            this.clicksMs.push(now);
            let neededClicks = 5;
            if (this.clicksMs.length > neededClicks) {
                _.remove(this.clicksMs, i=>i===0);
            }
            let oldest = this.clicksMs[0];

            let n = this.clicksMs.length;
            if (now - oldest < n * 1000) {
                //that was quick enough !
                let devMenu = this.props.config.devMenu;
                if (n === neededClicks) {
                    //toggle dev menu
                    //this.setState({devMenu: !this.state.devMenu});

                    this.props.dispatch({
                        type: CONFIG_SET,
                        option: 'devMenu',
                        value: !devMenu
                    });
                    this.clicksMs = null;
                }
                else if (n >= neededClicks /2 ) {
                    let message = `${neededClicks - n} more clicks to ${devMenu ? "deactivate" : "activate"}dev menu`;
                    Toast.show(message);
                }
            }
            else {
                this.clicksMs = null;
            }

        };
        return <TouchableOpacity onPress={handler}><Text>v1.0</Text></TouchableOpacity>
    }


    render() {
        let user = this.getUser(currentUserId());

        return (

            <ImageBackground
                source={require('../img/welcome_screen.jpg')}
                style={{
                    flex: 1,
                    alignItems: 'center',
                }}
            >
                <KeyboardAwareScrollView
                    scrollEnabled={false}
                    contentContainerStyle={{flex: 1}}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>

                        <Image style={{width: 200, marginBottom: 25}} source={require('../img/logo_goodsh.png')}
                               resizeMode="contain"/>

                        {this.renderUser(user)}

                        <Text style={{
                            fontFamily: 'Chivo',
                            marginBottom: 20,
                            fontSize: 17,
                            marginTop: 18
                            // fontWeight: 'bold'
                        }}>{i18n.t('profile_screen.title', {love: i18n.t('profile_screen.love')})}</Text>
                        <Text style={{fontSize: 15, textAlign: "center"}}>{i18n.t('profile_screen.subtitle')}</Text>


                        <SmartInput
                            containerStyle={{padding: 6}}
                            inputStyle={{fontSize: 17}}
                            inputContainerStyle={{padding: 4, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth}}
                            execAction={(input: string) => this.sendFeedback(input)}
                            placeholder={"profile_screen.feedback_textfield.placeholder"}
                            multiline
                            height={100}
                            returnKeyType={'send'}
                        />



                        {renderSimpleButton("#logout", this.logout.bind(this), {loading: this.state.reqLogout === 'sending'})}

                        {
                            this.props.config.devMenu &&
                            renderSimpleButton("#dev mode", () => this.props.navigator.showModal({
                                    screen: 'goodsh.DebugScreen', // unique ID registered with Navigation.registerScreen
                                    title: "#DevMenu", // navigation bar title of the pushed screen (optional)
                                    navigatorButtons: {
                                        leftButtons: [
                                            {
                                                id: Nav.CLOSE_MODAL,
                                                title: "#Cancel"
                                            }
                                        ],
                                    },
                                }
                            ))
                        }


                        {renderLink("#Terms", "https://goodsh.it/terms")}


                        <View style={{position: 'absolute', bottom: 15}}>
                            {this.renderVersion()}
                        </View>



                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>

        );
    }


    clicksMs;


    renderUser(user) {
        return <View style={{
            flexDirection: 'row',
            alignItems: 'center',
        }}
        >
            {user && user.image && <Image source={{uri: user.image}}
                                          style={styles.userAvatar}
            />}
            {user && <Text style={styles.userName}>{user.firstName + " " + user.lastName}</Text>}

        </View>;
    }

    sendFeedback(input: string) {
        return new Promise((resolve, reject)=> {

            let url = `mailto:feedback@goodsh.it?subject=GOODSH' Feedback&body=${input}`;
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                    resolve();
                } else {
                    let message = "Don't know how to open URI: " + url;
                    console.log(message);
                    reject(message);
                }
            });

            resolve();
        });
    }

    logout() {
        Api.safeExecBlock.call(
            this,
            () => {
                return authActions.logout(this.props.dispatch)
            },
            'reqLogout'
        );
    }

    getUser(userId: Id) {
        const {data} = this.props;

        return buildData(data, "users", userId);
    }
}

const GET_USER = ApiAction.create("get_user(profile)");

const actions = (() => {

    const include = "";

    return {
        getUser: (userId: Id) => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({include}),

    };
})();


const styles = StyleSheet.create({
    input:{
        height: 100,
        width: "80%",
        fontFamily: 'Chivo',
        fontSize: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        borderColor: UI.Colors.grey1,

    },
    userName: {
        fontSize: 20,
        fontFamily: 'Chivo',
        //color: UI.Colors.grey1,
        padding: 10,
    },
    userAvatar: {
        height: 30,
        width: 30,
        borderRadius: 15
    },
});


