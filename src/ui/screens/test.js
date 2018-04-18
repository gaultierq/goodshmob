// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckBox} from "react-native-elements";
import Markdown from "react-native-showdown";
import NoSpamDialog from "./NoSpamDialog";
import {Navigation} from "react-native-navigation";
import GTouchable from "../GTouchable";


type Props = {
};

type State = {
};


export default class TestScreen extends Component<Props, State> {


    // static navigatorStyle = {
    //     navBarHidden: true,
    // };

    constructor() {
        super()
        setTimeout(()=>{
            this.props.navigator.showInAppNotification({
                screen: "goodsh.InAppNotif", // unique ID registered with Navigation.registerScreen
                passProps: {}, // simple serializable object that will pass as props to the in-app notification (optional)
                autoDismissTimerSec: 30 // auto dismiss notification in seconds
            })
        }, 3000)
    }

    render() {
        return <View style={{width: '100%', height: '100%', backgroundColor: 'transparent'}} >
            <GTouchable onPress={()=>{
                this.props.navigator.showInAppNotification({
                    screen: "goodsh.InAppNotif", // unique ID registered with Navigation.registerScreen
                    passProps: {
                        text: 'hi there! hi there!hi there!hi there!hi there!hi there!hi there!hi there!hi there!hi there!'
                    }, // simple serializable object that will pass as props to the in-app notification (optional)
                    autoDismissTimerSec: 30 // auto dismiss notification in seconds
                })
            }
            }>
                <Text style={{marginTop: 400}}>press me</Text>
            </GTouchable>
        </View>
        // return <NoSpamDialog />
        // return null;
    }
}
