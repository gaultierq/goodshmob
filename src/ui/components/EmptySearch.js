import type {Node} from 'react'
// @flow
import React, {Component} from 'react'
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {SFP_TEXT_MEDIUM} from "../fonts"
import {Colors} from "../colors"

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

type Props = {
    text: string,
    icon?: Node,
};

type State = {
};

@logged
export default class EmptySearch extends Component<Props, State> {

    render() {

        const color = Colors.greyish;
        return (
            <View style={{
                flex: 1,
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',

            }}>
                {
                    this.props.icon
                }
                <Text style={{
                    textAlign: 'center',
                    fontSize: 17,
                    margin: 15,
                    fontFamily: SFP_TEXT_MEDIUM,
                    color: color

                }}>{this.props.text}</Text>
            </View>
        )

    }
}

export function renderBlankIcon(category: string): Node {
    const color = Colors.greyish
    const size = 50

    switch (category) {
        case 'places':
            return <MaterialIcons name="restaurant" size={size} color={color}/>;
        case 'musics':
            return <MaterialIcons name="library-music" size={size} color={color}/>;
        case 'consumer_goods':
            return <SimpleLineIcons name="present" size={size} color={color}/>;
        case 'movies':
            return <MaterialIcons name="movie" size={size} color={color}/>;
        case 'users':
            return <MaterialIcons name="face" size={size} color={color}/>;
        case 'savings':
            return <MaterialIcons name="list" size={size} color={color}/>;
    }
}
