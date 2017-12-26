// @flow

import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {isEmpty} from "lodash";
import type {List} from "../../types";
import {Colors} from "../colors";
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
        fontSize: 16,
        marginTop: 4,
        marginBottom: 6,
    }
});