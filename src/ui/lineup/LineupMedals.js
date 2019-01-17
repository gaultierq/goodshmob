// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'
import {LINEUP_PADDING} from "../UIStyles"
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM} from "../fonts"
import {Colors} from "../colors"
import type {Lineup, RNNNavigator, User} from "../../types"
import connect from "react-redux/es/connect/connect"
import {
    LINEUP_AUTHOR,
    LINEUP_FOLLOWS_COUNT_SELECTOR,
    LINEUP_SAVING_COUNT_SELECTOR,
    LINEUP_SELECTOR
} from "../../helpers/Selectors"
import {GAvatar} from "../GAvatar"
import {pressToSeeUser} from "../../managers/Links"
import {createStructuredSelector} from "reselect"

type Props = {
    navigator: RNNNavigator,
    lineup: Lineup,

    savingsCount?: number,
    followersCount?: number,
    author?: User,

}
type State = {}



@connect(() => createStructuredSelector(
    {
        lineup: LINEUP_SELECTOR(),
        savingsCount: LINEUP_SAVING_COUNT_SELECTOR(),
        followersCount: LINEUP_FOLLOWS_COUNT_SELECTOR(),
        author: LINEUP_AUTHOR(),
    }
))
export class LineupMedals extends Component<Props, State> {

    render() {
        let {lineup, savingsCount, followersCount, author} = this.props
        savingsCount = savingsCount.total
        followersCount = followersCount.total

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
                        { <View style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            marginRight: 8,
                        }}>
                            <GAvatar person={author} seeable style={{alignItems: 'center',}} size={24}/>
                            {author && <Text onPress={pressToSeeUser(author)} style={[styles.counters_names, {marginLeft: 6, color: Colors.black}, ]}>{_.join([author.firstName, author.lastName[0] + "."], ' ')}</Text>}
                        </View>
                        }
                        {
                            this.renderMedal(savingsCount, i18n.t('lineup_medals.elements', {count: savingsCount}))
                        }
                        {
                            this.renderMedal(followersCount, i18n.t('lineup_medals.followers', {count: followersCount}))
                        }
                    </View>
                </View>
            </View>
        )
    }

    renderMedal(count: number, text: string) {
        return <View style={{
            justifyContent: 'flex-end',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 8,
        }}>
            {count >0 && <Text style={[styles.counters]}>{`${count}`}</Text>}
            {count >0 && <Text style={[styles.counters_names]}>{text}</Text>}
        </View>
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
