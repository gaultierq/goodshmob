// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as UI from "../UIStyles";
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";


export default class ItemCell extends React.Component {


    propTypes: {
        onPressItem: React.PropTypes.func;
    };

    render() {
        let item = this.props.item;
        if (!item) throw new Error("expecting item");

        let resource = item;
        let image = resource ? resource.image : undefined;

        let cardMargin = 8;

        return (
            <TouchableHighlight
                onPress={this.props.onPressItem}>
                <View style={
                    { ...UI.CARD(cardMargin), ...UI.TP_MARGINS(cardMargin), padding: cardMargin,
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: "flex-start"
                    }}>

                    { image && <Image
                        source={{uri: image}}
                        resizeMode='contain'
                        style={{
                            alignSelf: 'center',
                            height: 80,
                            width: 80,
                        }}
                    />
                    }
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


}
