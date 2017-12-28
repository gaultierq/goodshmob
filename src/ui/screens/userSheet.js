// @flow
import React from 'react';
import {Animated, Dimensions, Easing, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import Screen from "../components/Screen";
import Sheet from "../components/sheet";

type Props = {
    children: Node
};

type State = {
};

export default class UserSheet extends Screen<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    render() {
        return (
            <Sheet navigator={this.props.navigator}>
                <View style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', height: 369}}/>
            </Sheet>
        );
    }

}

