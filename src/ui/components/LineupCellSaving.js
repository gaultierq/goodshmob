// @flow

import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {isEmpty} from "lodash";
import type {Saving} from "../../types";
import {Colors} from "../colors";
import {CachedImage} from "react-native-img-cache";


type Props = {
    saving: Saving,
    style?: *,
};

type State = {
};


const DIM = 70;

export default class LineupCellSaving extends React.Component<Props, State> {

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
        let item = this.props.saving;
        let image = item && item.resource && item.resource.image;

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

