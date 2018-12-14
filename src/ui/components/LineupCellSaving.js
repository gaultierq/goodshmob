// @flow

import React from 'react'
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {isEmpty} from "lodash"
import type {Item} from "../../types"
import {Colors} from "../colors"
import GImage from './GImage'


type Props = {
    item: Item,
    style?:*,
};

type State = {
};


export const ITEM_DIM = 70;

export default class LineupCellSaving extends React.PureComponent<Props, State> {

    static displayName = "LineupCellSaving";

    static styles = StyleSheet.create({
        cell: {
            height: ITEM_DIM,
            width: ITEM_DIM,

            borderRadius: 4,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: Colors.greyish
        }
    });

    render() {
        let item = this.props.item;
        let image = item && item.image;

        if (image) {
            return <GImage
                source={{uri: image}}
                resizeMode="cover"
                style={[LineupCellSaving.styles.cell, this.props.style, ]}
            />
        }
        else {
            return (
                <View style={[LineupCellSaving.styles.cell, {opacity: 0.3, backgroundColor: Colors.grey3}]}/>
            )
        }
    }
}

export const EmptyCell = props => {
    let {children, style, ...attr} = props;
    return <View {...attr} style={[
        LineupCellSaving.styles.cell,
        {
            backgroundColor: Colors.grey3,
            // marginRight: 10,
            // opacity: 1 - (0.2 * i),
            alignItems: 'center',
            justifyContent:'center'
        }, style
    ]}>
        {children}
        {/*{ i === 0 && onPressEmptyLineup && <Icon name="plus" size={45} color={Colors.dirtyWhite}/>}*/}
    </View>
};


