import type {Node} from 'react'
// @flow
import React, {Component} from 'react'
import {ActivityIndicator, Image, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {SFP_TEXT_MEDIUM} from "../fonts"
import {Colors} from "../colors"

type Props = {
    text: string,
    icon?: Node,
};

type State = {
};

@logged
export default class BlankSearch extends Component<Props, State> {

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
    const size = 70

    switch (category) {
        case 'places':
            return <Image style={{width: size}} source={require('../../img2/restaurants.png')} resizeMode="contain"/>
        case 'musics':
            return <Image style={{width: size}} source={require('../../img2/music.png')} resizeMode="contain"/>
        case 'consumer_goods':
            return <Image style={{width: size}} source={require('../../img2/stuff.png')} resizeMode="contain"/>
        case 'movies':
            return <Image style={{width: size}} source={require('../../img2/film.png')} resizeMode="contain"/>
        case 'users':
            return <Image style={{width: size}} source={require('../../img2/users.png')} resizeMode="contain"/>
        case 'savings':
            return <Image style={{width: size}} source={require('../../img2/list.png')} resizeMode="contain"/>

    }
}
