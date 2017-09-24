// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../../screens/UIStyles";
import * as activityAction from "../actions"
import {connect} from "react-redux";

class LineupCell extends React.Component {


    render() {
        let lineup : Model.List = this.getLineup();
        let savings: Model.Saving[] = lineup.savings;

        //let activity: Model.Activity = this.props.activity;
        let user: Model.User = lineup.user;
        let resource = lineup.resource;
        let image = resource ? resource.image : undefined;

        let target: Model.List = lineup.target;
        let cardMargin = 12;

        return (
            <View style={{}}>
                <Text style={Object.assign({backgroundColor: 'transparent'}, UI.SIDE_MARGINS(cardMargin))}>{lineup.name}</Text>

                <View style={Object.assign({marginTop: cardMargin, marginBottom: cardMargin}, UI.CARD(cardMargin))}>
                    <FlatList
                        data={savings}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={(item, index) => item.id}
                        horizontal={true}
                    />
                </View>
            </View>
        )
    }

    getLineup() {
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
export default connect(mapStateToProps)(LineupCell);
