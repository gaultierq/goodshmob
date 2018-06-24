// @flow
import type {Node} from 'react'
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import GTouchable from "../GTouchable"

type Props = {
    containerStyle:? any,
    children?: Node,
    onClickClose: () => void
};

type State = {
};

export default class Closable extends Component<Props, State> {

    render() {
        const {containerStyle, children} = this.props;
        const {height, width} = Dimensions.get('window');

        return (
            <View style={[styles.container, containerStyle,
                {height, width}]}
            >
                <GTouchable
                    onPress={()=>this.props.onClickClose()}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        marginLeft: 20,
                        marginTop: 30,
                    }}
                >
                    <Image source={require('../../img2/closeXGrey.png')}
                           resizeMode="contain"
                           style={{
                               width: 30,
                               height: 30,}}
                    />
                </GTouchable>

                {children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
