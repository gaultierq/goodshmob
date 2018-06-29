// @flow
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {Navigation} from "react-native-navigation"
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
        return <View style={{ flex: 1,backgroundColor: 'red'}} >
            <MapView
                style={{flex: 1}}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />
        </View>
        // return <NoSpamDialog />
        // return null;
    }
}
