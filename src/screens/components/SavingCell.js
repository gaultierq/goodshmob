// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../UIStyles";
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";

class SavingCell extends React.Component {


    render() {
        let saving : Model.Saving = this.getSaving();
        let resource = saving.resource;
        let image = resource ? resource.image : undefined;

        let cardMargin = 12;

        return (
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
        )
    }

    getSaving() {
        return buildNonNullData(this.props.data, "savings", this.props.savingId);
    }

    renderItem(item) {
        let it: Model.Saving = item.item;
        let image = it.resource ? it.resource.image : undefined;


        return <Image
            source={{uri: image}}
            style={{
                height: 50,
                width: 50,
                margin: 10
            }}
        />
    }
}
const mapStateToProps = (state, ownProps) => ({
    data: state.data
});
export default connect(mapStateToProps)(SavingCell);
