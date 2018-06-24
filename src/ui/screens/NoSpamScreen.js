// @flow

import React, {Component} from 'react'
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import {Navigation} from 'react-native-navigation'
import NoSpamDialog from "./NoSpamDialog"


type Props = {
};

type State = {
};


export default class NoSpamScreen extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    render() {
        return (<View style={{flex:1, backgroundColor: 'transparent'}}>
            <NoSpamDialog/>
        </View>);
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogContentView: {
        // padding: 20,
        // paddingBottom: 0,
    },
});