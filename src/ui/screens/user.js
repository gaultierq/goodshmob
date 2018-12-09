// @flow

import React from 'react'
import {Alert, Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import type {Id, RequestState, RNNNavigator, User} from "../../types"
import {CheckBox} from "react-native-elements"
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import Screen from "../components/Screen"
import {LINEUP_SECTIONS, MainBackground, scheduleOpacityAnimation} from "../UIComponents"
import {LINEUP_PADDING, STYLES} from "../UIStyles"
import UserLineups from "./userLineups"
import * as Api from "../../managers/Api"
import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions"
import {getUserActions, GUserAction, U_CONNECT} from "../userRights"
import {createSelector} from "reselect"
import {USER_SECLECTOR} from "../../helpers/ModelUtils"
import {UserHeader} from "../components/UserHeader"
import {Colors} from "../colors"
import {SFP_TEXT_BOLD} from "../fonts"
import GTouchable from "../GTouchable"
import {CANCELABLE_MODAL2} from "../Nav"

type Props = {
    userId: Id,
    navigator?: RNNNavigator,
    user?: ?User,
    action?: GUserAction,
};

type State = {
    reqFetchUser?: RequestState,
    reqConnect?: RequestState,
    reqDisconnect?: RequestState,
    showFilter?: boolean,
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
        drawUnderNavBar: true,
        navBarTransparent: true,
        navBarTranslucent: true,
        navBarBackgroundColor: Colors.dirtyWhite,
        topBarElevationShadowEnabled: false
    }

    static navigatorButtons = CANCELABLE_MODAL2

    componentDidMount() {

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUser(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    getUser() {
        return this.props.user
    }


    render() {
        let user = this.getUser();

        // this.props.navigator.setButtons(this.getButtons(this.props.action, this.props.userId))
        const lineupsCount = _.get(user, 'meta.lineupsCount')
        const savingsCount = _.get(user, 'meta.savingsCount')

        let userId = this.props.userId;

        return (
            <MainBackground>
                <UserLineups
                    displayName={"user feed"}
                    feedId={"user list"}
                    userId={userId}
                    navigator={this.props.navigator}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    renderSectionHeader={({section}) => section.renderSectionHeader()}
                    ListHeaderComponent={(
                        <View style={{marginTop: 30}}>
                            <UserHeader avatarProps={{size: LINEUP_PADDING * 8,}}
                                        avatarContainerStyle={{marginTop: 32,}}
                                        navigator={this.props.navigator}
                                        user={user}/>
                            <View style={{
                                alignItems: 'center',
                                marginHorizontal: LINEUP_PADDING,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                            }}>
                                <Text style={{
                                    color:Colors.greyishBrown,
                                    fontSize: 24,
                                    fontFamily: SFP_TEXT_BOLD
                                }}>{lineupsCount} listes - {savingsCount} éléments</Text>
                                <GTouchable onPress={() => {
                                    this.setState({showFilter: !this.state.showFilter})
                                    scheduleOpacityAnimation()
                                }}><Image style={{tintColor: this.state.showFilter ? Colors.black : Colors.brownishGrey}} source={require('../../img2/search.png')} resizeMode="contain"/>
                                </GTouchable>
                            </View>
                        </View>
                    )}
                    sectionMaker={LINEUP_SECTIONS(this.props.navigator, this.props.dispatch, userId)}
                    hideFilter={!this.state.showFilter}

                />
            </MainBackground>
        );
    }
}
