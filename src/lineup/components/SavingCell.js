// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../../screens/UIStyles";
import * as activityAction from "../actions"
import {connect} from "react-redux";

class SavingCell extends React.Component {


    render() {
        let saving : Model.List = this.getSaving();
        let cardMargin = 12;

        return (
            <View style={Object.assign(
                {
                    flex: 1,
                    flexDirection: 'row',
                    marginTop: cardMargin, marginBottom: cardMargin,

                }, UI.CARD(cardMargin))}>

            </View>
        )
    }

    getSaving() {
        return this.props.lineup.all[this.props.lineupId];
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
    lineup: state.lineup
});
export default connect(mapStateToProps)(SavingCell);
