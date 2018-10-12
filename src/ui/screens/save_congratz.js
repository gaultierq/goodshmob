// @flow
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {currentUser, logged} from "../../managers/CurrentUser"
import type {MapStateToProps} from "react-redux"
import {connect} from "react-redux"
import Sheet from "../components/sheet"
import {LINEUP_PADDING} from "../UIStyles"
import {Colors} from "../colors"
import type {Saving} from "../../types"
import {Avatar} from "../UIComponents"
import i18n from "../../i18n"
import HTMLView from "react-native-htmlview"
import {SFP_TEXT_BOLD, SFP_TEXT_REGULAR} from "../fonts"


type Props = {
    navigator: any,
    saving: Saving,
};

type State = {
};

@logged
@connect()
export default class SaveCongratz extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    render() {

        let friends = currentUser().friends
        let title = "example de titre"
        let listName = "example de liste"

        return (
            <Sheet navigator={this.props.navigator}>
                <View style={{
                    justifyContent: 'center',
                    height: 275,
                    backgroundColor: Colors.orange,
                }}>
                    <View style={{margin: LINEUP_PADDING,}}>

                        <HTMLView value={`<div>${i18n.t("save_congratz", {item_title: title, list_name: listName})}</div>`} stylesheet={htmlStyles}/>

                        <View style={{flexDirection: 'row'}}>
                            {friends.map(f => <Avatar user={f} key={f.id}/>)}
                        </View>


                    </View>
                </View>
            </Sheet>
        );
    }

}

const htmlStyles = StyleSheet.create({

    div: {
        fontFamily: SFP_TEXT_REGULAR,
        fontSize: 24,
        lineHeight: 26,
        color: Colors.white,
        // textAlign:'center',

        // textShadowColor: 'rgba(0, 0, 0, 1)',
        // textShadowOffset: {width: -1, height: 1},
        // textShadowRadius: 8,
    },
    bold: {
        fontFamily: SFP_TEXT_BOLD,
    },
})
