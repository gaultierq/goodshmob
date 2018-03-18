// @flow

import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {isEmpty} from "lodash";
import type {Item} from "../../types";
import {Colors} from "../colors";
import {CachedImage} from "react-native-img-cache";


type Props = {
    item: Item,
    style?: *,
};

type State = {
};


const DIM = 70;

export default class LineupCellSaving extends React.PureComponent<Props, State> {

    static displayName = "LineupCell";

    static styles = StyleSheet.create({
        cell: {
            height: DIM,
            width: DIM,
            borderColor: Colors.greyish,
            borderRadius: 4,
        }
    });

    render() {
        let item = this.props.item;
        let image = item && item.image;

        if (image) {
            return <CachedImage
                source={{uri: image}}
                resizeMode="cover"
                style={[this.props.style, LineupCellSaving.styles.cell, {borderWidth: StyleSheet.hairlineWidth}]}
            />
        }
        else {
            return (
                <View style={[LineupCellSaving.styles.cell, {opacity: 0.3, backgroundColor: Colors.grey3/*this.state.colors[index]*/}]}/>
            )
        }
    }
}

