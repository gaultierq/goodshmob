// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckBox} from "react-native-elements";
import Markdown from "react-native-showdown";
import NoSpamDialog from "./NoSpamDialog";


type Props = {
};

type State = {
};


export default class TestScreen extends Component<Props, State> {



    render() {
        return <NoSpamDialog />
        // return null;
    }
}
