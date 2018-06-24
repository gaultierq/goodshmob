// @flow

import React from 'react'
import {Alert, Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import type {Id, RequestState, RNNNavigator, User} from "../../types"
import {CheckBox} from "react-native-elements"
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import Screen from "../components/Screen"
import {
    CONNECT_RIGHT_BUTTON,
    DISCONNECT_RIGHT_BUTTON,
    LINEUP_SECTIONS,
    MainBackground,
    RIGHT_BUTTON_SPINNER
} from "../UIComponents"
import * as UI from "../UIStyles"
import {STYLES} from "../UIStyles"
import UserLineups from "./userLineups"
import {fullName} from "../../helpers/StringUtils"
import * as Api from "../../managers/Api"
import {
    actions as userActions,
    actionTypes as userActionTypes,
    CONNECT,
    createFriendship,
    deleteFriendship,
    DISCONNECT
} from "../../redux/UserActions"
import {getUserActions, GUserAction, U_CONNECT, U_DISCONNECT} from "../userRights"
import {createSelector} from "reselect"
import {USER_SECLECTOR} from "../../helpers/ModelUtils"
import _Messenger from "../../managers/Messenger"

type Props = {
    userId: Id,
    navigator?: RNNNavigator,
    user?: ?User,
    action?: GUserAction
};

type State = {
    reqFetchUser?: RequestState,
    reqConnect?: RequestState,
    reqDisconnect?: RequestState,
};


const selector = createSelector(
    [
        USER_SECLECTOR,
        state => state.pending
    ],
    (user, pending) => {
        let action = null
        if (user) {
            let actions = getUserActions(user, pending)
            if (actions.indexOf(U_CONNECT) >= 0) action = U_CONNECT
            // if (actions.indexOf(U_DISCONNECT) >= 0) action = U_DISCONNECT
        }
        return {user, action}
    }
)

@logged
@connect(selector)
export default class UserScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false,
        // those props only affect Android
        navBarTitleTextCentered: true,
        navBarSubTitleTextCentered: true,
    };

    unsubscribe: ?() => void



    componentDidMount() {
        this.unsubscribe = this.props.navigator.addOnNavigatorEvent(event => {
            let user = this.getUser()
            if (user) {
                if (event.id === 'connect_' + user.id) {
                    //followLineupPending(this.props.dispatch, user)
                    this.connectWith(user)
                }
                else if (event.id === 'disconnect_' + user.id) {
                    // unfollowLineupPending(this.props.dispatch, user)
                    this.disconnectWith(user)
                }
            }
        });

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUser(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    connectWith(user: User) {
        let action = createFriendship(user.id).createActionDispatchee(CONNECT);

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            action,
            'reqConnect'
        ).then(()=> {
                _Messenger.sendMessage(i18n.t("friends.messages.connect"));
            }
        );
    }

    disconnectWith(user: User) {
        Alert.alert(
            i18n.t("friends.alert.title"),
            i18n.t("friends.alert.label"),
            [
                {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: i18n.t("actions.ok"), onPress: () => {
                        let action = deleteFriendship(user.id).createActionDispatchee(DISCONNECT);
                        Api.safeDispatchAction.call(
                            this,
                            this.props.dispatch,
                            action,
                            'reqDisconnect'
                        ).then(()=> {
                                _Messenger.sendMessage(i18n.t("friends.messages.disconnect"));
                            }
                        );
                    }},
            ],
            { cancelable: true }
        )
    }


    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    }

    getUser() {
        return this.props.user
    }

    getButtons(action: GUserAction, userId: Id): any {
        if (this.state.reqConnect === 'sending' || this.state.reqDisconnect === 'sending') {
            return {rightButtons: [RIGHT_BUTTON_SPINNER],}
        }
        if (action) {
            if (action === U_CONNECT) return {rightButtons: [CONNECT_RIGHT_BUTTON(userId)],}
            if (action === U_DISCONNECT) return {rightButtons: [DISCONNECT_RIGHT_BUTTON(userId)],}
        }
        return {rightButtons: []}
    }

    render() {
        let user = this.getUser();

        this.props.navigator.setButtons(this.getButtons(this.props.action, this.props.userId))

        let userId = this.props.userId;
        //FIXME: rm platform specific code, https://github.com/wix/react-native-navigation/issues/1871
        if (this.isVisible() && user) {
            if (__IS_IOS__) {
                this.props.navigator.setStyle({...UI.NavStyles,
                    navBarCustomView: 'goodsh.UserNav',
                    navBarCustomViewInitialProps: { user }
                });
            }
            else {
                this.setNavigatorTitle(this.props.navigator, {title: fullName(user)})
            }
        }

        return (
            <MainBackground>
                <UserLineups
                    displayName={"user feed"}
                    feedId={"user list"}
                    userId={userId}
                    navigator={this.props.navigator}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    renderSectionHeader={({section}) => section.renderSectionHeader()}
                    sectionMaker={LINEUP_SECTIONS(this.props.navigator, this.props.dispatch, userId)}

                />
            </MainBackground>
        );
    }
}
