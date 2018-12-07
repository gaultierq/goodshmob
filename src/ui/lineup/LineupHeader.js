// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {LINEUP_PADDING} from "../UIStyles"
import {Avatar} from "../UIComponents"
import {fullName2} from "../../helpers/StringUtils"
import {SFP_TEXT_BOLD, SFP_TEXT_REGULAR} from "../fonts"
import {Colors} from "../colors"
import type {Lineup, RNNNavigator} from "../../types"
import connect from "react-redux/es/connect/connect"
import {LINEUP_SELECTOR} from "../../helpers/ModelUtils"
import {createSelector} from "reselect"
import {GLineupAction, L_ADD_ITEM, L_FOLLOW, L_SHARE, L_UNFOLLOW, LineupRights} from "../lineupRights"
import {displayShareLineup, startAddItem} from "../Nav"
import {followLineupPending, unfollowLineupPending} from "./actions"
import GTouchable from "../GTouchable"

type Props = {
    navigator: RNNNavigator,
    lineup: Lineup,
    actions?: GLineupAction[]
}
type State = {}


export const selector = createSelector(
    [
        LINEUP_SELECTOR,
        state => state.pending
    ],
    (lineup, pending) => {
        let actions = LineupRights.getActions(lineup, pending)
        actions = _.sortBy(actions, a => a.priority)
        return {lineup, actions}
    }
)

@connect(selector)
export class LineupHeader extends Component<Props, State> {


    static defaultProps = {
    }

    render() {
        let {lineup, actions} = this.props

        const avatarContainerSize = LINEUP_PADDING * 7
        const user = lineup.user
        const savingsCount = _.get(lineup, 'meta.savingsCount')
        const followersCount = _.get(lineup, 'meta.followersCount')

        let button, shareB
        if (actions) {
            if (actions.indexOf(L_FOLLOW) >= 0) {
                button = <Text onPress={()=>{
                    followLineupPending(this.props.dispatch, lineup)
                }} style={[styles.button_dim, styles.button, styles.button_inactive]}>{i18n.t('actions.follow')}</Text>
            }
            else if (actions.indexOf(L_UNFOLLOW) >= 0) {
                button = <Text onPress={()=>{
                    unfollowLineupPending(this.props.dispatch, lineup)
                }} style={[styles.button_dim, styles.button, styles.button_inactive]}>{i18n.t('actions.followed')}</Text>
            }
            else if (actions.indexOf(L_ADD_ITEM) >= 0) {
                button = <Text onPress={()=>{
                    startAddItem(this.props.navigator, lineup.id)
                }} style={[styles.button_dim, styles.button, styles.button_inactive]}>{i18n.t('actions.add')}</Text>
            }

            if (actions.indexOf(L_SHARE) >= 0) {
                shareB = (
                    <GTouchable
                        onPress={()=>{
                            displayShareLineup({
                                navigator: this.props.navigator,
                                lineup: this.props.lineup
                            })
                        }}
                        style={{
                            alignItems: 'center',
                            // backgroundColor:'red',
                            flex:1}}
                    >
                        <Image source={__IS_IOS__ ? require('../../img2/share-ios.png') : require('../../img2/share-android.png')}
                               resizeMode="contain"
                               style={styles.share_image}/>
                    </GTouchable>)
            }
        }

        return (
            <View style={{flexDirection: 'row', margin: LINEUP_PADDING}}>
                <View style={{
                    alignItems: 'center',
                    marginRight: LINEUP_PADDING
                }}>
                    <Avatar style={{alignItems: 'center',}} user={user}
                            size={avatarContainerSize}/>
                    <Text style={[{marginTop: 4}, styles.userName]}>{fullName2(user)}</Text>
                </View>

                <View style={{
                    flex: 1,
                    // backgroundColor: 'red',

                }}>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <View style={{alignItems: 'center',}}>
                            <Text style={[styles.counters]}>{`${savingsCount}`}</Text>
                            <Text style={[styles.counters_names]}>{`éléments`}</Text>
                        </View>
                        <View style={{alignItems: 'center',}}>
                            <Text style={[styles.counters]}>{`${followersCount}`}</Text>
                            <Text style={[styles.counters_names]}>{`abonnés`}</Text>
                        </View>
                    </View>
                    <View style={{
                        // backgroundColor: 'red',
                        flex:1, flexDirection:'row', alignItems: 'center', justifyContent: 'flex-start', }}>
                        {button}
                        {shareB}
                    </View>

                </View>
            </View>
        )
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
        padding: 8, flex:1
    },
    button: {
        color: Colors.green,
        backgroundColor: 'transparent',
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 20,
        borderWidth: 2,
        borderColor: Colors.green,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // margin: 20,
    },
    button_active: {
        color: Colors.white,
        backgroundColor: Colors.green,

    },
    button_inactive: {
        color: Colors.green,
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
