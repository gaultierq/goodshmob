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
import {GUserAction} from "../userRights"
import {
    USER_SELECTOR,
    USER_SYNCED_LINEUPS_COUNT_SELECTOR,
    USER_SYNCED_SAVINGS_COUNT_SELECTOR, userId
} from "../../helpers/Selectors"
import {UserHeader} from "../components/UserHeader"
import {Colors} from "../colors"
import {SFP_TEXT_BOLD} from "../fonts"
import GTouchable from "../GTouchable"

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
}

@logged
@connect(() => {
    const user = USER_SELECTOR()
    const lineupsCount = USER_SYNCED_LINEUPS_COUNT_SELECTOR()
    const savingsCount = USER_SYNCED_SAVINGS_COUNT_SELECTOR()

    return (state, props) => ({
        user: user(state, props),
        lineupsCount: lineupsCount(state, props),
        savingsCount: savingsCount(state, props),
    })
})
export default class UserScreen extends Screen<Props, State> {


    static navigatorStyle = {
        navBarHidden: true,
    }

    componentDidMount() {

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUser(userId(this.props)).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    render() {
        let {user, lineupsCount, savingsCount} = this.props

        let userId = user.id
        return (
            <MainBackground>
                <UserLineups
                    displayName={"user feed"}
                    feedId={"user list"}
                    style={{marginTop: 40,}}
                    userId={userId}
                    navigator={this.props.navigator}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    renderSectionHeader={({section}) => section.renderSectionHeader()}
                    ListHeaderComponent={(isContentReady) => (
                        <View key={"user-header"}>
                            <UserHeader
                                navigator={this.props.navigator}
                                user={user}/>

                            <View style={{
                                alignItems: 'center',
                                marginHorizontal: LINEUP_PADDING,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 12,
                            }}>
                                <Text style={{
                                    color:Colors.greyishBrown,
                                    fontSize: 24,
                                    fontFamily: SFP_TEXT_BOLD
                                }}>{i18n.t('user_medals.lists', {count:lineupsCount})} - {i18n.t('user_medals.elements', {count: savingsCount})}</Text>
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
