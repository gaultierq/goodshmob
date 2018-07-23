// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {connect} from "react-redux"
import type {Color, Id, Lineup} from "../../types"
import {ViewStyle} from "../../types"
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {Colors} from "../colors"
import Icon from 'react-native-vector-icons/FontAwesome'
import UserRowI from "../activity/components/UserRowI"
import {buildData} from "../../helpers/DataUtils"
import {STYLES} from "../UIStyles"
import {GoodshContext} from "../UIComponents"
import {L_FOLLOW, LineupRights} from "../lineupRights"
import GTouchable from "../GTouchable"
import {followLineupPending} from "../lineup/actions"
import {SFP_TEXT_BOLD} from "../fonts"

export type State = {

}
export type Props = {
    lineupId: Id,
    dataResolver?: Id => Lineup,
    style?: ViewStyle,
    children?: Node,
}


@connect(state => ({
    data: state.data,
    pending: state.pending,
}))
@logged
export default class LineupTitle2 extends Component<Props, State> {

    render() {

        let {lineupId, dataResolver, style, children} = this.props

        dataResolver = dataResolver || (id => buildData(this.props.data, 'lists', id))
        let lineup = dataResolver(lineupId)
        let author =  lineup.user;
        return (
            <GoodshContext.Consumer>
                { ({userOwnResources}) => (
                    <View style={[{paddingVertical: 6}, style, {
                        flex:1,
                    }]}>
                        <View style={{
                            // flex: 1,
                            flexDirection: 'row',
                            // backgroundColor: 'purple'
                        }}>

                            <View style={{
                                flex:1,
                                flexDirection: 'row',
                                // justifyContent: 'space-between',
                                // backgroundColor: 'orange'
                                // paddingTop: 15,
                                // paddingBottom: 10,
                            }}>
                                <Text style={STYLES.SECTION_TITLE}>
                                    {lineup.name}
                                    {' '}

                                    {
                                        this.getMedals(lineup)
                                    }

                                </Text>
                            </View>

                            {
                                children
                            }

                        </View>
                        {
                            !userOwnResources && author && author.firstName && <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 0,
                                // backgroundColor: 'yellow'
                            }}>
                                <Text style={styles.smallText}>{i18n.t('search.by')}</Text>
                                <UserRowI
                                    user={author}
                                    noImage={true}
                                    style={{flex: 0, marginLeft: 4}} //TODO: rm when removed in UserRowI
                                    textStyle={{color: Colors.greyish}}
                                />
                            </View>
                        }
                    </View>
                )}

            </GoodshContext.Consumer>

        );
    }

    getMedals(lineup: Lineup) {
        const it = (function* () {
            yield true
            yield false
        })();

        let lr = new LineupRights(lineup, this.props.pending)
        let canFollow = lr.canExec(L_FOLLOW)
        return [
            //<Text key={'savings-count-medal'} style={{ color: Colors.greyish }}>{ `(${savingCount})` }</Text>,
            this.renderMedal(_.get(lineup, 'meta.savingsCount', -1), "th-large", it),
            this.renderMedal(_.get(lineup, 'meta.followersCount', -1), "star", it, _.get(lineup, 'meta.followed', false) ? Colors.green : undefined),
            (canFollow && <GTouchable
                    style={{
                        // backgroundColor: 'red',
                        height: 15
                    }}
                    onPress={()=>{
                        followLineupPending(this.props.dispatch, lineup)
                    }}>
                    <Text style={{
                        color: Colors.green,
                        fontSize: 14,
                        fontFamily: SFP_TEXT_BOLD
                        // backgroundColor: 'blue'
                    }}>{i18n.t('actions.follow')}</Text>
                </GTouchable>)
        ];
    }

    renderMedal(count: number, icon: string, displayDot: () => boolean, color: Color = Colors.greyish) {
        const iconSize = 15;

        // fixme : this is bad
        if (__IS_ANDROID__) {
            return count > 0 && <Text style={[styles.medalsContainer, {paddingLeft: 10, marginLeft: 10}]} key={icon}>
                {icon === 'th-large' && <Text style={[styles.smallText, {marginLeft: 4, color,
                    alignSelf: 'flex-end',
                    // backgroundColor: 'red',
                }]}>({count})</Text>}
                {icon === 'star' && <Text style={[styles.smallText, {color, marginHorizontal: 6}]}>★</Text>}
                {icon === 'star' && <Text style={[styles.smallText, {marginLeft: 4, color,
                    alignSelf: 'flex-end',
                    // backgroundColor: 'red',
                }]}>{count}</Text>}
            </Text>;
        }

        return count > 0 && <Text key={icon}>
            {displayDot.next().value && <Text style={[styles.smallText, {color, marginHorizontal: 6}]}>• </Text>}
            <Icon name={icon} size={iconSize} color={color}/>
            <Text style={[styles.smallText, {marginLeft: 4, color,
                alignSelf: 'flex-end',
                // backgroundColor: 'red',
            }]}>{' '}{count}{' '}</Text>
        </Text>;
    }
}


const styles = StyleSheet.create({
    smallText: {
        fontSize: 14,
        color: Colors.greyish
    },
    medalsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },

})
