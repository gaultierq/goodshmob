// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as UI from "../UIStyles";
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";

export default class ItemCell extends React.Component {


    render() {
        let item = this.props.item;
        if (!item) throw new Error("expecting item");

        let resource = item;
        let image = resource ? resource.image : undefined;

        let cardMargin = 12;

        return (
            <TouchableHighlight
                onPress={this.onSavingPressed.bind(this)}>
                <View style={
                    { ...UI.CARD(cardMargin), ...UI.TP_MARGINS(cardMargin), padding: cardMargin,
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: "flex-start"
                    }}>

                    <Image
                        source={{uri: image}}
                        resizeMode='contain'
                        style={{
                            alignSelf: 'center',
                            height: 100,
                            width: 100,
                        }}
                    />
                    <View style={{flex:1, padding: 15}}>
                        <Text style={{fontSize: 18, fontFamily: 'Chivo-Light', }}>{resource.title}</Text>
                        <Text style={{fontSize: 12, color: UI.Colors.grey2}}>{resource.subtitle}</Text>
                    </View>
                    <Image source={require('../../img/mini-g-number.png')} resizeMode="contain"
                           style={{
                               alignSelf: 'center',
                               width: 20,
                               height: 20,
                           }}
                    />
                </View>
            </TouchableHighlight>
        )
    }

    onSavingPressed() {
        // let saving = this.getSaving();
        // this.props.navigator.push({
        //     screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
        //     title: "Activity Details", // navigation bar title of the pushed screen (optional)
        //     titleImage: require('../../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
        //     passProps: {activityId: saving.id, activityType: saving.type}, // Object that will be passed as props to the pushed screen (optional)
        //     animated: true, // does the push have transition animation or does it happen immediately (optional)
        //     animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
        //     backButtonTitle: undefined, // override the back button title (optional)
        //     backButtonHidden: false, // hide the back button altogether (optional)
        //     navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
        //     navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        // });
    }

    // getSaving() {
    //     return buildNonNullData(this.props.data, "savings", this.props.savingId);
    // }

}
// const mapStateToProps = (state, ownProps) => ({
//     data: state.data
// });
