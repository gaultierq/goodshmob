// @flow

import React from 'react'
import {Share, StyleSheet, Text, View} from 'react-native'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"
import GTouchable from "../GTouchable"

type Props = {
    text: string,
    onPress: ?() => void
}
type State = {
}

export default class GButton extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <View>
                <GTouchable
                    style={styles.button}
                    onPress={this.props.onPress}>
                    <Text style={styles.buttonText}>{this.props.text}</Text>
                </GTouchable>
            </View>
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
    },
    buttonText: {
        color: Colors.white,
        fontSize: 17,
        fontFamily: SFP_TEXT_MEDIUM,
        fontWeight: 'bold'
    }
})
