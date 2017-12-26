// @flow

import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {isEmpty} from "lodash";
import type {Saving} from "../../types";
import {Colors} from "../colors";
//;

type Props = {
    saving: Saving,
    style?: *,
};

type State = {
};


const DIM = 70;

export default class LineupCellSaving extends React.Component<Props, State> {

    static displayName = "LineupCell";

    render() {
        let item = this.props.saving;
        let image = item && item.resource && item.resource.image;
        const dim = DIM;
        const style = {
            height: dim,
            width: dim,
            borderColor: Colors.greyish,
            borderRadius: 4,
        };

        if (image) {
            return <Image
                source={{uri: image}}
                resizeMode="cover"
                style={[this.props.style, style, {borderWidth: StyleSheet.hairlineWidth}]}
            />
        }
        else {
            return (
                <View style={[style, {opacity: 0.3, backgroundColor: Colors.grey3/*this.state.colors[index]*/}]}/>
            )
        }
    }
}

const styles = StyleSheet.create({
});