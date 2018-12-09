'use strict';
// @flow

import React, {Component} from 'react'

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
} from 'react-native'
import {connect} from 'react-redux'
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Id, ms, RequestState, RNNNavigator, User} from "../../types"
import {buildData} from "../../helpers/DataUtils"
import * as Api from "../../managers/Api"
import * as authActions from '../../auth/actions'
import {renderSimpleButton, stylePadding} from "../UIStyles"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-root-toast'
import {CONFIG_SET} from "../../reducers/dataReducer"
import * as Nav from "../Nav"
import {Colors} from "../colors"
import GTouchable from "../GTouchable"
import {SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "../fonts"
import FeedSeparator from "../activity/components/FeedSeparator"
import {getDeviceInfo} from "../../managers/DeviceManager"
import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions"
import {GAvatar} from "../GAvatar"
import {openLinkSafely} from "../../managers/Links"

type Props = {
    navigator: RNNNavigator,
    data: any
}

type State = {
    //user?: User
    feedback?: string,
    reqLogout?: RequestState,
    devMenu?: boolean
}

@logged
@connect(state => ({
    data: state.data,
    config: state.config,
}))
export default class Profile extends Component<Props, State> {

    state = {user: null};

    clicksMs: ms

    componentWillMount() {
        // let {userId} = this.props;
        // if (!userId) throw "provide userId";

        let userId = currentUserId();

        if (!this.getUser(userId)) {
            this.props.dispatch(userActions.getUser(userId)
                .createActionDispatchee(userActionTypes.GET_USER)).then(({data})=>{
                // let user = this.getUser(userId);
                // this.setState({user});
            });
        }
    }

    render() {
        const userId = currentUserId()
        let user = userId && this.getUser(userId);

        return (

            <View style={{
                // flex: 1,
                height: "100%",
                backgroundColor: Colors.white
            }}>
                <View style={{
                    margin: 40,
                    marginTop: 80
                }}>
                    {this.renderUser(user)}
                </View>

                <View >
                    <FeedSeparator/>
                    {
                        this.renderButton(i18n.t('actions.invite'), () => {
                            this.props.navigator.showModal({
                                screen: 'goodsh.InviteManyContacts',
                                title: i18n.t('actions.invite'),
                                navigatorButtons: Nav.CANCELABLE_MODAL,
                            })

                        })
                    }
                    <FeedSeparator/>
                    {
                        this.renderButton(i18n.t('profile_screen.title'), () => {
                            this.sendFeedback(encodeURIComponent(i18n.t('profile_screen.subtitle')))
                        })
                    }
                    <FeedSeparator/>
                    {
                        this.renderButton(i18n.t('actions.terms'), () => {
                            openLinkSafely("https://goodsh.it/terms");
                        })
                    }
                    <FeedSeparator/>

                </View>


                <View style={{
                    position: 'absolute',
                    bottom: 52,
                    left: 17
                }}>
                    {
                        renderSimpleButton(
                            i18n.t("actions.logout"),
                            this.logout.bind(this),
                            {
                                loading: this.state.reqLogout === 'sending',
                                style: {alignSelf: 'flex-start'},
                                textStyle: styles.footerButton
                            }
                        )
                    }

                    {
                        (this.props.config.devMenu || __DEV__ )&&
                        renderSimpleButton(i18n.t("dev.label"),
                            () => this.props.navigator.showModal({
                                    screen: 'goodsh.DebugScreen', // unique ID registered with Navigation.registerScreen
                                    title: i18n.t("dev.title"), // navigation bar title of the pushed screen (optional)
                                    navigatorButtons: Nav.CANCELABLE_MODAL,
                                }
                            ),
                            {
                                style: {alignSelf: 'flex-start'},
                                textStyle: styles.footerButton
                            }
                        )
                    }
                    {this.renderVersion()}
                </View>

            </View>

        );
    }

    renderButton(text: string, onPress: () => void) {
        return (
            <GTouchable style={styles.headerContainer} onPress={onPress}>
                <Text style={styles.header}>{text}</Text>
                {this.renderChevron()}
            </GTouchable>
        )
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
        let version = getDeviceInfo('version') || '?';
        return <GTouchable onPress={handler}><Text style={styles.version}>{`v${version}`}</Text></GTouchable>
    }


    renderChevron() {
        return <Image source={require('../../img2/rightArrowSmallGrey.png')}
                      style={{
                          width: 7,
                          height: 12,
                      }}
        />;
    }

// clicksMs;


    renderUser(user: User) {
        return <View style={{
            flexDirection: 'column',
            alignItems: 'center',
        }}
        >
            <GAvatar person={user} size={100} />
            {user && <Text style={styles.userName}>{user.firstName + " " + user.lastName}</Text>}

        </View>;
    }

    sendFeedback(input: string) {
        return new Promise((resolve, reject)=> {

            //let url = `mailto:feedback@goodsh.it?subject=GOODSH' Feedback&body=${input}`;
            let url = `mailto:feedback@goodsh.it?subject=Goodsh - Feedback`;
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

const styles = StyleSheet.create({
    userName: {
        fontSize: 20,
        padding: 10,
    },
    footerButton: {
        fontSize:15, fontWeight: 'normal', fontFamily: SFP_TEXT_REGULAR, color: Colors.greyish
    },
    userAvatar: {
        height: 45,
        width: 45,
        borderRadius: 22
    },
    header: {
        fontSize: 20,
        fontFamily: SFP_TEXT_MEDIUM,
        color: Colors.black,
        borderTopColor: Colors.greyish,

    },
    headerContainer: {
        ...stylePadding(15,22),
        margin: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    version: {
        fontSize: 12.5,
        fontFamily: SFP_TEXT_MEDIUM,
        color: Colors.greyish
    }
});
