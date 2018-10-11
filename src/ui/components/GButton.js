// @flow

import React from 'react'
import {Share, StyleSheet, Text, View} from 'react-native'
import Button from 'apsl-react-native-button'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"

type Props = {
    text: string,
    onPress: () => void
}
type State = {
}

export default class ShareButton extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <View>
                <Button
                    style={styles.button}
                    onPress={this.props.onPress}>
                    <Text style={styles.buttonText}>{this.props.text}</Text>
                </Button>
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
