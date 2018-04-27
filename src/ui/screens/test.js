// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckBox} from "react-native-elements";
import Markdown from "react-native-showdown";
import NoSpamDialog from "./NoSpamDialog";
import {Navigation} from "react-native-navigation";
import GTouchable from "../GTouchable";
import GSearchBar from "../GSearchBar";


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
            <GTouchable onPress={()=>{
                this.props.navigator.showInAppNotification({
                    screen: "goodsh.InAppNotif", // unique ID registered with Navigation.registerScreen
                    passProps: {
                        title: 'ceci est un titre',
                        subtitle: 'ceci est du contenu, ceci est du contenu, ceci est du contenu, ceci est du contenu, ceci est du contenu, ',
                    }, // simple serializable object that will pass as props to the in-app notification (optional)
                    autoDismissTimerSec: 30 // auto dismiss notification in seconds
                })
            }
            }>
                <Text style={{marginTop: 400}}>press me</Text>
            </GTouchable>
            {/*<GSearchBar/>*/}
        </View>
        // return <NoSpamDialog />
        // return null;
    }
}
