// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {connect} from "react-redux";
import type {Id, Lineup} from "../../types";
import {logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Colors} from "../colors";
import Icon from 'react-native-vector-icons/FontAwesome';
import UserRowI from "../activity/components/UserRowI";
import {buildData} from "../../helpers/DataUtils";
import {SFP_TEXT_MEDIUM} from "../fonts";

export type State = {

}
export type Props = {
    lineupId: Id,
    dataResolver?: Id => Lineup,
    style?: any,
    skipAuthor?: boolean,
    children?: Node,
}


@connect(state => ({
    data: state.data,
    pending: state.pending,
}))
@logged
export default class LineupTitle2 extends Component<Props, State> {

    render() {

        let {lineupId, skipAuthor, dataResolver, style, children} = this.props

        dataResolver = dataResolver || (id => buildData(this.props.data, 'lists', id))
        let lineup = dataResolver(lineupId)
        let author =  lineup.user;
        return (
            <View style={style}>
                <View style={{flexDirection: 'row',
                    // backgroundColor: 'red'
                }}>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        // paddingTop: 15,
                        // paddingBottom: 10,
                    }}>
                        <Text style={{
                            fontSize: 20,
                            fontFamily: SFP_TEXT_MEDIUM
                        }}>
                            {lineup.name}

                            {
                                __IS_IOS__ && this.getMedals(lineup)
                            }

                        </Text>
                    </View>

                    {
                        __IS_ANDROID__ && this.getMedals(lineup)
                    }

                    {
                        children
                    }

                </View>
                {
                    !skipAuthor && author && author.firstName && <View style={{
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
                        />
                    </View>
                }
            </View>

        );
    }

    getMedals(lineup: Lineup) {
        var it = (function *() {
            yield true
            yield false
        })()
        return [
            this.renderMedal(_.get(lineup, 'meta.savingsCount', -1), "th-large", it),
            this.renderMedal(_.get(lineup, 'meta.followersCount', -1), "star", it)
        ];
    }

    renderMedal(count: number, icon: string, displayDot: () => boolean) {
        const color = Colors.greyish;
        const iconSize = 15;

        return count > 0 && <View style={[styles.medalsContainer, {marginLeft: 4}]} key={icon}>
            {displayDot.next().value && <Text style={[styles.smallText, {color, marginHorizontal: 6}]}>•</Text>}
            <Icon name={icon} size={iconSize} color={color}/>
            <Text style={[styles.smallText, {marginLeft: 4, color,
                alignSelf: 'flex-end',
                // backgroundColor: 'red',
            }]}>{count}</Text>
        </View>;
    }
}


const styles = StyleSheet.create({
    smallText: {
        fontSize: 14,
    },
    medalsContainer: {
        flexDirection: 'row',
        // backgroundColor: 'yellow',
        alignItems: 'flex-end'
        // flex: 0,
    }
})
