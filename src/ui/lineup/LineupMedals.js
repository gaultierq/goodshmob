// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {LINEUP_PADDING} from "../UIStyles"
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM} from "../fonts"
import {Colors} from "../colors"
import type {Lineup, RNNNavigator} from "../../types"
import connect from "react-redux/es/connect/connect"
import {LINEUP_SELECTOR} from "../../helpers/ModelUtils"
import {createSelector} from "reselect"
import {GLineupAction} from "../lineupRights"
import {GAvatar} from "../GAvatar"
import {pressToSeeUser} from "../../managers/Links"

type Props = {
    navigator: RNNNavigator,
    lineup: Lineup,
    actions?: GLineupAction[]
}
type State = {}


export const selector = createSelector(
    [
        LINEUP_SELECTOR,
    ],
    lineup => lineup
)

@connect(selector)
export class LineupMedals extends Component<Props, State> {


    static defaultProps = {
    }

    render() {
        let {lineup} = this.props

        const user = lineup.user
        const savingsCount = _.get(lineup, 'meta.savingsCount')
        const followersCount = _.get(lineup, 'meta.followersCount')


        return (
            <View>
                <View
                    style={{
                        // flexWrap: "wrap",
                        flex: 1,
                    }}>

                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        paddingHorizontal: LINEUP_PADDING,
                        // justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        { user && <View style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            marginRight: 8,
                        }}>
                            <GAvatar person={user} seeable style={{alignItems: 'center',}} size={LINEUP_PADDING * 2}/>
                            <Text onPress={pressToSeeUser(user)} style={[{marginLeft: 6}, styles.counters_names]}>{_.join([user.firstName, user.lastName[0] + "."], ' ')}</Text>
                        </View>}
                        <View style={{
                            justifyContent: 'flex-end',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 8,
                        }}>
                            <Text style={[styles.counters]}>{`${savingsCount}`}</Text>
                            <Text style={[styles.counters_names]}>{i18n.t('lineup_medals.elements', {count:savingsCount})}</Text>
                        </View>
                        {
                            followersCount > 0 && <View style={{
                                justifyContent: 'flex-end',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginRight: 8,
                            }}>
                                <Text style={[styles.counters]}>{`${followersCount}`}</Text>
                                <Text style={[styles.counters_names]}>{i18n.t('lineup_medals.followers', {count:followersCount})}</Text>
                            </View>
                        }
                    </View>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    counters: {
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 16,
        // lineHeight: 20,
        marginRight: 4,
        // backgroundColor: 'blue',
        color: Colors.black,
    },
    counters_names: {
        fontFamily: SFP_TEXT_MEDIUM,
        color: Colors.brownishGrey,
        fontSize: 15,
    },
    button_dim: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        // flex:1
        borderRadius: 15,
        height: 30,
    },
    button: {
        color: Colors.green,
        backgroundColor: 'transparent',
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 18,
        borderColor: Colors.green,

        // backgroundColor: 'red',

        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    button_active: {
        color: Colors.green,
        borderWidth: 1,

    },
    button_inactive: {
        color: Colors.greyish,
    },
    userName: {
        alignItems: 'center',
        fontFamily: SFP_TEXT_BOLD,
        color: Colors.greyish,
        fontSize: 15,
    },
    share_image: {
        alignSelf: 'center',
        width: 56,
        height: 56,
    },

})
