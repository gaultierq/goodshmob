// @flow

import type {Node} from 'react'
import React from 'react'


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import type {Person, TextStyle} from "../../../types"
import {ViewStyle} from "../../../types"
import {Colors} from "../../colors"
import {SFP_TEXT_BOLD} from "../../fonts"
import {GAvatar} from "../../GAvatar"
import {fullName} from "../../../helpers/StringUtils"

type Props = {
    person: Person,
    noImage?: boolean,
    children?: Node,
    rightComponent?: Node,
    small?: boolean,
    style?: ViewStyle,
    textStyle?: TextStyle,
}

type State = {
};

export default class PersonRowI extends React.Component<Props, State> {

    render() {

        let {person, noImage} = this.props

        return <View style={[{flex:1, }, this.props.style, styles.userContainer]}>
            {
                !noImage && <GAvatar person={person} size={30} style={{marginRight: 8}} />
            }

            <View style={{flex:1}}>
                <View style={[styles.rightContainer]}>
                    <Text style={[styles.rightText, this.props.textStyle]}>
                        {
                            fullName(this.props.person)
                        }
                    </Text>
                    {
                        this.props.rightComponent
                    }
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
