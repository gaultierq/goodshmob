// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";
import ActivityDescription from "./ActivityDescription";
import type {Activity, ActivityType, Id} from "../../types"
import ActivityBody from "./ActivityBody";
import * as UI from "../../screens/UIStyles";
import FeedSeparator from "./FeedSeparator";
import ActivityActionBar from "./ActivityActionBar";


type Props = {
    data: any,
    activity: Activity,
    activityId: Id,
    activityType: ActivityType,
    navigator: any,
    onPressItem: (any) => void,
    skipLineup:? boolean;
    skipDescription:? boolean;
};

type State = {
};

@connect((state, ownProps) => ({
    data: state.data,
}))
export default class ActivityCell extends React.Component<Props, State> {

    lastRenderedActivity: any;

    render() {
        const {skipLineup, skipDescription} = this.props;

        let activity = this.getActivity();
        this.lastRenderedActivity = this.readActivity(this.props);
        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 10,
                marginBottom: 10
            }}>
                {
                    !skipDescription &&
                    <ActivityDescription
                        activity={activity}
                        navigator={this.props.navigator}
                        skipLineup={!!skipLineup}
                    />
                }

                <View style={UI.CARD()}>
                    <TouchableOpacity onPress={this.props.onPressItem}>
                        <ActivityBody
                            activity={activity}
                            navigator={this.props.navigator}
                        />
                    </TouchableOpacity>

                    <FeedSeparator/>

                    <ActivityActionBar activity={activity} navigator={this.props.navigator}/>

                </View>
            </View>
        )
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!ENABLE_PERF_OPTIM) return true;
        let act = this.readActivity(nextProps);

        if (act === this.lastRenderedActivity) {
            superLog('ActivityCell render saved');
            return false;
        }
        return true;
    }

    readActivity(nextProps) {
        return _.get(nextProps, `data.${nextProps.activityType}.${nextProps.activityId}`);
    }

    getActivity() {
        return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }
}
