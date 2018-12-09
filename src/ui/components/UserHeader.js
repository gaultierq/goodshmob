// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {LINEUP_PADDING} from "../UIStyles"
import {SFP_TEXT_BOLD, SFP_TEXT_REGULAR} from "../fonts"
import {Colors} from "../colors"
import type {RequestState, RNNNavigator, User} from "../../types"
import connect from "react-redux/es/connect/connect"
import {USER_SECLECTOR} from "../../helpers/ModelUtils"
import {createSelector} from "reselect"
// import {followLineupPending, unfollowLineupPending} from "./actions"
import {GAvatar} from "../GAvatar"
import {getUserActions, GUserAction, U_CONNECT, U_DISCONNECT} from "../userRights"
import {CONNECT, createFriendship, disconnectFromUserWithAlert} from "../../redux/UserActions"
import * as Api from "../../managers/Api"
import _Messenger from "../../managers/Messenger"
import {Loader} from "../Loader"
import {fullName2} from "../../helpers/StringUtils"

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


const selector = createSelector(
    [
        USER_SECLECTOR,
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

        return (
            <View style={{
                flexDirection: 'row',
                // alignItems: 'flex-end',
                margin: LINEUP_PADDING,
                flex:1,
            }}>
                <View style={[{
                    alignItems: 'flex-end',
                    marginRight: LINEUP_PADDING,
                    // backgroundColor: 'red',
                }, avatarContainerStyle]}>
                    <GAvatar person={user} {...avatarProps} />
                </View>

                <View style={{flexWrap: "wrap",
                    flex:1,}}>
                    <Text style={{
                        fontFamily: SFP_TEXT_BOLD,
                        fontSize: 40,
                        color: Colors.black,


                    }}>{fullName2(user, '\n')}</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between',flex: 1,
                        marginTop: 12}}>
                        <View style={{alignItems: 'center',}}>
                            <Text style={[styles.counters]}>{`${followersCount}`}</Text>
                            <Text style={[styles.counters_names]}>{`amis`}</Text>
                        </View>
                        {button}
                    </View>
                </View>

            </View>
        )
    }

    getButton(actions, user) {
        let button
        if (actions) {
            if (this.state.reqConnect === 'sending' || this.state.reqDisconnect === 'sending') {
                button = <Loader size={40}/>
            }
            else if (actions.indexOf(U_CONNECT) >= 0) {
                button = <Text onPress={() => {
                    this.connectWith(user)
                }} style={[styles.button_dim, styles.button, styles.button_active,]}>{i18n.t('actions.connect')}</Text>
            }
            else if (actions.indexOf(U_DISCONNECT) >= 0) {
                button = <Text onPress={() => {
                    disconnectFromUserWithAlert(user, this, this.props.dispatch)
                }}
                               style={[styles.button_dim, styles.button, styles.button_inactive]}>{i18n.t('actions.connected')}</Text>
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
        fontSize: 22,
        color: Colors.greyishBrown,
    },
    counters_names: {
        fontFamily: SFP_TEXT_REGULAR,
        fontSize: 18,
        color: Colors.greyish,
    },
    button_dim: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        // flex:1
        borderRadius: 20,
        height: 40,
    },
    button: {
        color: Colors.green,
        backgroundColor: 'transparent',
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 18,
        borderColor: Colors.green,

        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // margin: 20,
    },
    button_active: {
        // color: Colors.white,
        // backgroundColor: Colors.green,
        borderWidth: 1,

    },
    button_inactive: {
        color: Colors.greyish,
        backgroundColor: 'transparent',
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
