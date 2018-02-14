// @flow

import React from 'react';
import {StyleSheet, Image, TouchableOpacity} from 'react-native';
import {Colors} from "../colors";

type Props = {
    onPress?: () => void
};

export default class ShareButton extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.props.onPress()}>
                <Image style={styles.image}
                       source={require("../../img2/backArrowBlack.png")}/>

            </TouchableOpacity>
        );
    }

}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.white,
        borderWidth: 0,
        borderRadius: 25,
        height: 50,
        padding: 10,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',

    },
    image: {
        width: 30,
        height: 20,
    }
});
