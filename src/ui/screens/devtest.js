// @flow
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {Navigation} from "react-native-navigation"
import GTouchable from "../GTouchable"
import AskInput from "../components/AskInput"


type Props = {
};

type State = {
};


export default class TestScreen extends Component<Props, State> {


    // static navigatorStyle = {
    //     navBarHidden: true,
    // };

    render() {
        return <View style={{width: '100%', height: '100%', backgroundColor: 'transparent'}} >
            <AskInput/>
        </View>
        // return <NoSpamDialog />
        // return null;
    }
}
