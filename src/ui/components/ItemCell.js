// @flow
import type {Node} from 'react'
import React from 'react'
import {Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import * as UI from "../UIStyles"
import type {Item} from "../../types"
import {Colors} from "../colors"
import GImage from './GImage'


type Props = {
    item: Item,
    displayDetails?: boolean,
    children?: Node
};

type State = {
};

export default class ItemCell extends React.Component<Props, State> {


    render() {
        let item = this.props.item;
        if (!item) throw new Error("expecting item");

        let resource = item;
        let image = resource ? resource.image : undefined;

        return (
            <View style={[styles.container, styles.containerInner]}>
                <View style={[styles.image, UI.STYLES.lightBorder, {backgroundColor: Colors.dirtyWhite}]}>
                    {
                        image && <GImage
                            source={{uri: image}}
                            resizeMode='cover'
                            style={[styles.image, UI.STYLES.lightBorder]}/>

                    }
                </View>
                <View style={styles.containerText}>
                    <Text
                        style={styles.title}
                        numberOfLines={this.props.displayDetails ? 7 : 3}
                    >{resource.title}</Text>
                    {resource.subtitle && <Text style={styles.subtitle}>{resource.subtitle}</Text>}
                    {
                        this.props.children
                    }
                </View>
            </View>
        )
    }


}


const styles = StyleSheet.create({
    container: {
        padding: 8,
        flex: 1
    },
    containerInner: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: 'center'
    },
    image: {
        alignSelf: 'center',
        height: 80,
        width: 80,
        borderRadius: 8,
    },
    containerText: {
        flex:1,
        padding: 15
    },
    placeholder: {
        backgroundColor: Colors.greyish
    },
    title: {fontSize: 18, },
    subtitle: {fontSize: 12, color: Colors.greyish}

});
