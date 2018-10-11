// @flow

import React from 'react'
import {Share, StyleSheet, Text, View} from 'react-native'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"
import GTouchable from "../GTouchable"

type Props = {
    text: string,
    onPress: ?() => void,
    style?: any,
}
type State = {
}

export default class GButton extends React.Component<Props, State> {

    render() {
        const {style, text, ...attr} = this.props
        return (
            <GTouchable
                style={[styles.button, style]}
                {...attr}
            >
                <Text style={styles.buttonText}>{text}</Text>
            </GTouchable>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.green,
        borderWidth: 0,
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        textAlignVertical: 'center',

        fontSize: 17,
        fontFamily: SFP_TEXT_MEDIUM,
        fontWeight: 'bold'
    }
})
