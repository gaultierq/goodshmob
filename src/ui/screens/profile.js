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
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Id, RequestState} from "../../types";
import {buildData} from "../../helpers/DataUtils";
import ApiAction from "../../helpers/ApiAction";
import * as Api from "../../managers/Api";
import * as authActions from '../../auth/actions'

import {renderLink, renderSimpleButton} from "../UIStyles";
import SmartInput from "../components/SmartInput";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-root-toast';
import {CONFIG_SET} from "../../reducers/dataReducer";
import * as Nav from "../Nav";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import {CachedImage} from "react-native-img-cache";
import Icon from "react-native-vector-icons/SimpleLineIcons";

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


@logged
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
        return <GTouchable onPress={handler}><Text style={{textAlign: 'center'}}>v1.0</Text></GTouchable>
    }


    render() {
        let user = this.getUser(currentUserId());

        return (
            <KeyboardAwareScrollView
                style={{flex: 1}}
                scrollEnabled={false}
                contentContainerStyle={{
                    flex: 1,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    paddingRight:20,
                    paddingLeft: 20
            }}>

                <View>

                    {this.renderUser(user)}

                    <View style={{
                            alignItems: 'center',
                            marginTop: 30,
                            marginBottom: 20,
                            paddingTop: 25,
                            paddingBottom: 25,
                            borderTopWidth: 1,
                            borderBottomWidth: 1,
                            borderColor: Colors.grey4,
                        }}>

                        <Icon name="heart" size={30} color={Colors.green} style={{marginBottom: 20}}/>

                        <Text style={{
                            fontSize: 14,
                            marginBottom: 10,
                            color: Colors.green
                        }}>{i18n.t('profile_screen.title', {love: i18n.t('profile_screen.love')})}</Text>

                        <SmartInput
                            containerStyle={{padding: 6}}
                            inputStyle={{fontSize: 14}}
                            inputContainerStyle={{padding: 4, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.green}}
                            execAction={(input: string) => this.sendFeedback(input)}
                            placeholder={'profile_screen.subtitle'}
                            multiline
                            height={100}
                            returnKeyType={'send'}
                            buttonStyle={{padding: 10}}
                        />

                    </View>


                    <View style={{alignSelf:'flex-start', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                        {renderSimpleButton(i18n.t("actions.logout"), this.logout.bind(this), {loading: this.state.reqLogout === 'sending'})}

                        {
                            this.props.config.devMenu &&
                            renderSimpleButton(i18n.t("dev.label"), () => this.props.navigator.showModal({
                                    screen: 'goodsh.DebugScreen', // unique ID registered with Navigation.registerScreen
                                    title: i18n.t("dev.title"), // navigation bar title of the pushed screen (optional)
                                    navigatorButtons: Nav.CANCELABLE_MODAL,
                                }
                            ))
                        }


                        <View>
                            {renderLink(i18n.t("actions.terms"), "https://goodsh.it/terms")}
                            <View style={{marginRight: 5, color: Colors.greyish}}>{this.renderVersion()}</View>
                        </View>
                    </View>

                </View>

            </KeyboardAwareScrollView>
        );
    }


    clicksMs;


    renderUser(user) {
        return <View style={{
            flexDirection: 'column',
            alignItems: 'center',
        }}
        >
            {user && user.image && <CachedImage source={{uri: user.image}}
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

        fontSize: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        borderColor: Colors.greyishBrown,

    },
    userName: {
        fontSize: 20,

        //color: UI.Colors.grey1,
        padding: 10,
    },
    userAvatar: {
        height: 45,
        width: 45,
        borderRadius: 22
    },
});
