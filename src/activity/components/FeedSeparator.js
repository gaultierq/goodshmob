// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";

export default class FeedSeparator extends React.Component {
    render() {
        return <View style={{width: "100%", height: StyleSheet.hairlineWidth, backgroundColor: UI.Colors.grey2}}/>;
    }
}
