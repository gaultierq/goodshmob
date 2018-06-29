// @flow
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {Navigation} from "react-native-navigation"
import GTouchable from "../GTouchable"
import MapView from 'react-native-maps'

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
            <MapView
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />
        </View>
    }
}
