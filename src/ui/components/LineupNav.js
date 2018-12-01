// @flow
import React, {Component} from 'react'
import {ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Navigation} from 'react-native-navigation'
import type {Id, User} from "../../types"
import {SFP_TEXT_MEDIUM} from "../fonts"
import {Colors} from "../colors"
import {Avatar} from "../UIComponents"
import {createSelector} from "reselect"
import {LINEUP_SELECTOR} from "../../helpers/ModelUtils"
import {connect} from "react-redux"
import {NAV_BACKGROUND_COLOR} from "../UIStyles"


type Props = NavBarState & {
    lineupId: Id,
}

type State = {
}

const getNavBarState = (lineup, pending) => {
    if (lineup) {
        let user = _.pick(lineup.user, ['firstName', 'lastName', 'image', 'id']);

        return {
            user: user,
            lineupName: lineup.name,
            lineupSavingCount: _.get(lineup, 'meta.savingsCount'),
        }

    }
    else return {}
}
export const selector = createSelector(
    [
        LINEUP_SELECTOR,
        state => state.pending
    ],
    (lineup, pending) => getNavBarState(lineup, pending)
)

type NavBarState = {
    user?: User,
    lineupName ?: string,
    lineupSavingCount ?: number,
}

@connect(selector)
export default class LineupNav extends Component<Props, State> {

    render() {
        console.debug("rendering LineupNav", this.props)
        const {
            user,
            lineupName,
            lineupSavingCount,
        } = this.props

        let imageDim = 32;

        return (
            <View style={{
                flex:1,
                //important hack: on android, the background color makes the custom nav component
                //rendering correctly.
                ///!\ DO NOT REMOVE /!\
                backgroundColor: NAV_BACKGROUND_COLOR,
                // backgroundColor: 'red',
                ...Platform.select({
                    android: {
                        width: '90%',
                    }
                }),

                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'}
            }>
                {/*<Avatar*/}
                    {/*user={user}*/}
                    {/*size={imageDim}/>*/}
                <Text style={{
                    fontSize: 17,
                    fontFamily: SFP_TEXT_MEDIUM,
                    marginLeft: 8,
                }}>{_.upperFirst(lineupName)}
                    {

                        lineupSavingCount && lineupSavingCount > 0 && <Text style={{color: Colors.greyish}}>{` (${lineupSavingCount})`}</Text>
                    }
                </Text>
            </View>
        )

    }
}
