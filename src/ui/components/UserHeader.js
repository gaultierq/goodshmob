// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {HEADER_STYLES, LINEUP_PADDING} from "../UIStyles"
import {SFP_TEXT_BOLD, SFP_TEXT_REGULAR} from "../fonts"
import {Colors} from "../colors"
import type {RequestState, RNNNavigator, User} from "../../types"
import connect from "react-redux/es/connect/connect"
import {USER_SELECTOR} from "../../helpers/Selectors"
import {createSelector} from "reselect"
// import {followLineupPending, unfollowLineupPending} from "./actions"
import {GAvatar} from "../GAvatar"
import {getUserActions, GUserAction, U_CONNECT, U_DISCONNECT} from "../userRights"
import {CONNECT, createFriendship, disconnectFromUserWithAlert} from "../../redux/UserActions"
import * as Api from "../../managers/Api"
import _Messenger from "../../managers/Messenger"
import {Loader} from "../Loader"
import {fullName2} from "../../helpers/StringUtils"
import GTouchable from "../GTouchable"

type Props = {
    navigator: RNNNavigator,
    user: User,
    actions?: GUserAction[],
    avatarSize?: number,
    avatarProps?: any,
    avatarContainerStyle?: any
}
type State = {
    reqConnect?: RequestState,

    //TODO: remove couplage
    reqDisconnect?: RequestState,
}


const selector = () => createSelector(
    [
        USER_SELECTOR(),
        state => state.pending
    ],
    (user, pending) => {
        let actions
        if (user) {
            actions = getUserActions(user, pending)
        }
        else {  actions = [] }
        return {user, actions}
    }
)


@connect(selector)
export class UserHeader extends Component<Props, State> {


    static defaultProps = {
        avatarProps: {
            size: LINEUP_PADDING * 7,
            style: {alignItems: 'center',}
        }
    }

    state = {}

    render() {
        let {user, actions, avatarProps, avatarContainerStyle} = this.props

        const followersCount = _.get(user, 'meta.friendsCount')

        let button = this.getButton(actions, user)

        const newVar = {
            fontFamily: SFP_TEXT_BOLD,
            fontSize: 40,
            color: Colors.black,
            alignItems: 'center',
            // backgroundColor: 'blue',


        }
        return (

            // back , name | avatar, connect
            <View style={{
                flexDirection: 'row',
                flex: 1,
            }}>
                <View
                    style={{paddingLeft: LINEUP_PADDING}}
                >
                    <View style={{
                        // flex:1,
                        flexDirection: 'row',
                        // paddingHorizontal: LINEUP_PADDING,
                        // backgroundColor: 'red',
                        alignItems: 'center',
                    }}>
                        {this.renderBackButton()}
                        <Text style={newVar}>{user.firstName}</Text>
                    </View>
                    <View style={{flexDirection: 'row',
                    }}>
                        <Text style={newVar}>{user.lastName}</Text>
                        {this.renderFriendsCount(followersCount)}
                    </View>
                </View>

                {/*2nd column*/}
                <View style={[{
                    flex:1,
                    alignItems: 'flex-end',
                    // backgroundColor: 'red',
                }, avatarContainerStyle]}>
                    <GAvatar person={user} size={LINEUP_PADDING * 6} style={{marginBottom: 12, marginRight: LINEUP_PADDING,}}/>
                    <View style={{position: 'absolute', bottom: 0, right: LINEUP_PADDING / 2}}>
                        {button}
                    </View>

                </View>

            </View>
        )
    }


    renderFriendsCount(followersCount: number) {
        return (!!followersCount && <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginBottom: 8,
            marginLeft: LINEUP_PADDING,
            // backgroundColor: 'red',
        }}>
            <Text style={[styles.counters, {marginRight: 4}]}>{`${followersCount}`}</Text>
            <Text style={[styles.counters_names]}>{i18n.t('user_medals.friends', {count:followersCount})}</Text>
        </View>)
    }

    renderBackButton() {

        return (
            <GTouchable
                // onLayout={e => this.setState({  backButtonWidth: _.get(e, 'nativeEvent.layout.width') })}
                onPress={() => this.props.navigator.dismissModal()}
                style={{
                    // paddingVertical: LINEUP_PADDING,
                    paddingRight: LINEUP_PADDING,
                    // backgroundColor: 'pink',
                }}>
                <Image source={require('../../img2/backArrowBlack.png')}
                       style={{
                           width: 40,
                       }}
                />
            </GTouchable>
        )
    }


    getButton(actions, user) {
        let button
        if (actions) {

            let gtouchStyle = {
                backgroundColor: 'white',
                height: 24,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }
            let textStyle = {
                fontFamily: SFP_TEXT_BOLD,
                fontSize: 13,
            }
            if (this.state.reqConnect === 'sending' || this.state.reqDisconnect === 'sending') {
                button = <Loader size={40}/>
            }
            else if (actions.indexOf(U_CONNECT) >= 0) {
                button = <GTouchable
                    style={[
                        gtouchStyle, {
                            borderColor: Colors.green,
                        }]
                    }  onPress={() => {this.connectWith(user)}}>
                    <Text
                        style={[textStyle, {
                            color: Colors.green,
                        }]
                        }>{i18n.t('actions.connect')}</Text>
                </GTouchable>
            }
            else if (actions.indexOf(U_DISCONNECT) >= 0) {
                button = <GTouchable style={[
                    gtouchStyle, {
                        borderColor: Colors.greyish,
                    }]
                } onPress={() => {disconnectFromUserWithAlert(user, this, this.props.dispatch)}}>
                    <Text style={[textStyle, {
                        color: Colors.greyish,
                    }]}>{i18n.t('actions.connected')}</Text>
                </GTouchable>
            }
        }
        return button
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
}

const styles = StyleSheet.create({
    counters: {
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 16,
        color: Colors.black,
    },
    counters_names: {
        fontFamily: SFP_TEXT_REGULAR,
        fontSize: 14,
        color: Colors.greyish,
    },

    userName: {
        alignItems: 'center',
        fontFamily: SFP_TEXT_BOLD,
        color: Colors.greyishBrown,
        fontSize: 15,
    },
    share_image: {
        alignSelf: 'center',
        width: 80,
        height: 80,
    },

})
