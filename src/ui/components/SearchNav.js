// @flow
import React, {Component} from 'react'
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Navigation} from 'react-native-navigation'
import GSearchBar2 from "./GSearchBar2"
import GTouchable from "../GTouchable"


type Props = {
    onPress?: () => void
}

type State = {
}

export default class SearchNav extends Component<Props, State> {

    render() {

        return (
            <GTouchable style={{
                flex:1,
                flexDirection: 'row',
                alignItems: 'center',
                // justifyContent: 'center',
                width: __DEVICE_WIDTH__ - 70,
            }
            } onPress={this.props.onPress}>

                <GSearchBar2 {...this.props} pointerEvents={'none'} editable={false} />
            </GTouchable>
        )

    }
}
