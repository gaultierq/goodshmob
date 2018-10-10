// @flow

import type {Node} from 'react'
import React from 'react'


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import type {TextStyle} from "../../../types"
import {ViewStyle} from "../../../types"
import {Colors} from "../../colors"
import {SFP_TEXT_BOLD} from "../../fonts"

type Props = {
    leftImage?: Node,
    leftText: string,
    children?: Node,
    rightComponent?: Node,
    small?: boolean,
    style?: ViewStyle,
    textStyle?: TextStyle,
}

type State = {
};

export default class PeopleRowI extends React.Component<Props, State> {

    render() {
        return <View style={[{flex:1, }, this.props.style, styles.userContainer]}>
            {
                this.props.leftImage
            }

            <View style={{flex:1}}>
                <View style={[styles.rightContainer]}>
                    <Text style={[styles.rightText, this.props.textStyle]}>{this.props.leftText}</Text>
                    {this.props.rightComponent}
                </View>
                {this.props.children}
            </View>

        </View>
    }

}

const styles = StyleSheet.create({
    userContainer: {alignItems: 'center', flexDirection: 'row'},
    rightContainer: {flexDirection: 'row'},
    rightText: {alignSelf: 'center', fontSize: 13, color: Colors.black, fontFamily: SFP_TEXT_BOLD}
});
