//@flow
import type {Node} from 'react'
import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import GTouchable from "../GTouchable"
import {Colors} from "../colors"
import Octicons from "react-native-vector-icons/Octicons"
import {SFP_TEXT_REGULAR} from "../fonts"
import {SEARCH_INPUT_RADIUS} from "../UIStyles"
import GSearchBar2 from './GSearchBar2'

type State = {
    value: string
};

export type Props = {
    onPress?: () => void,
    style?: any,
    searchBarProps?: any,
};
export default class TouchableSearchBar extends Component<Props, State> {


    render() {

        const {style} = this.props

        return (
            <GTouchable style={style} onPress={this.props.onPress}>
                <GSearchBar2 editable={false} {...this.props.searchBarProps}/>
            </GTouchable>
        )
    }
}

