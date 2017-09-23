// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../../screens/UIStyles";
import * as activityAction from "../actions"
import {connect} from "react-redux";

class LineupCell extends React.Component {

    render() {
        let lineup : Model.List = this.getLineup();

        //let activity: Model.Activity = this.props.activity;
        let user: Model.User = lineup.user;
        let resource = lineup.resource;
        let target: Model.List = lineup.target;
        let image = resource ? resource.image : undefined;

        let cardMargin = 12;
        let targetName;
        if (target) {
            let count = target.meta ? target.meta["savings-count"] : 0;
            targetName = target.name;
            if (count) targetName += " (" + count + ")"
        }
        let likesCount = lineup.meta ? lineup.meta["likes-count"] : 0;

        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 10,
                marginBottom: 10
            }}>
                <Text>{lineup.name}</Text>


            </View>
        )
    }

    getLineup() {
        return this.props.lineup.all[this.props.lineupId];
    }


}
const mapStateToProps = (state, ownProps) => ({
    lineup: state.lineup
});
export default connect(mapStateToProps)(LineupCell);
