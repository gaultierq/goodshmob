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
        let followersCount = _.get(lineup, 'meta.followersCount', -1)
        let savingsCount = _.get(lineup, 'meta.savingsCount', -1)
        const color = Colors.greyish;

        const iconSize = 16;
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
                        </Text>
                    </View>

                    {
                        savingsCount > 0 && <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 8,
                            flex: 0,
                            // backgroundColor: 'yellow'
                        }}>
                            <Icon name="th-large" size={iconSize} color={color}/>
                            <Text style={[styles.smallText, {marginLeft: 4}]}>{savingsCount}</Text>
                        </View>
                    }
                    {
                        followersCount > 0 && <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 8,
                            flex: 0,
                            // backgroundColor: 'yellow'
                        }}>
                            <Icon name="star" size={iconSize} color={color}/>
                            <Text style={[styles.smallText, {marginLeft: 4}]}>{followersCount}</Text>
                        </View>
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
}


const styles = StyleSheet.create({
    smallText: {
        fontSize: 12,
    }
})
