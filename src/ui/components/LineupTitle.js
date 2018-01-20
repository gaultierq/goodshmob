// @flow

import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {isEmpty} from "lodash";
import type {List} from "../../types";
import {Colors} from "../colors";
import Icon from 'react-native-vector-icons/Entypo';
//;

type Props = {
    lineup: List,
    style?: *,
};

type State = {
};


export default class LineupTitle extends React.Component<Props, State> {

    static displayName = "LineupTitle";


    render() {
        const  {lineup} = this.props;
        let savingCount = _.get(lineup, `meta.savings-count`, null);
        let countString = savingCount  !== null ? ' (' + savingCount + ')' : '';
        let title = lineup.name;

        return <Text style={[styles.lineupTitle, {}]}>
            {title}
            <Icon name="chevron-right" size={15} color={Colors.greyishBrown}/>
            <Text
                style={{color: Colors.greyish}}
            >
                {countString}
                {__IS_LOCAL__ && <Text
                    style={{color: Colors.grey3}}
                >{` id=(#${lineup.id.substr(0, 5)})`}</Text>}
            </Text>
        </Text>;
    }
}

const styles = StyleSheet.create({
    lineupTitle: {
        fontSize: 17,
        marginTop: 6,
        marginBottom: 7,
    }
});
