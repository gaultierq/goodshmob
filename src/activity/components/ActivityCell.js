// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";
import ActivityDescription from "./ActivityDescription";
import type {Activity, ActivityType, Id} from "../../types"
import ActivityBody from "./ActivityBody";
import * as UI from "../../screens/UIStyles";
import FeedSeparator from "./FeedSeparator";
import ActivityActionBar from "./ActivityActionBar";

class ActivityCell extends React.Component {

    props: {
        data: any,
        activity: Activity,
        activityId: Id,
        activityType: ActivityType,
        navigator: any,
        onPressItem: (any) => void
    };

    render() {
        let activity = this.getActivity();
        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 10,
                marginBottom: 10
            }}>
                <ActivityDescription activity={activity} navigator={this.props.navigator}/>

                <View style={UI.CARD()}>
                    <ActivityBody
                        activity={activity}
                        navigator={this.props.navigator}
                        onPressItem={this.props.onPressItem}
                    />

                    <FeedSeparator/>

                    <ActivityActionBar activity={activity} navigator={this.props.navigator}/>

                </View>

            </View>
        )
    }

    getActivity() {
        return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }
}


const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

export default connect(mapStateToProps)(ActivityCell);


