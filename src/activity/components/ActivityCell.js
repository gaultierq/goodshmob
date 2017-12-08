// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {buildNonNullData, sanitizeActivityType} from "../../utils/DataUtils";
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

    refKeys: any;

    render() {
        const {skipLineup, skipDescription} = this.props;

        let activity = this.getActivity();
        this.refKeys = this.makeRefObject(this.props);
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

                    <ActivityActionBar
                        activityId={activity.id}
                        activityType={activity.type}
                        navigator={this.props.navigator}
                    />

                </View>
            </View>
        )
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!ENABLE_PERF_OPTIM) return true;

        if (!this.hasChanged(nextProps)) {
            superLog('ActivityCell render saved');
            return false;
        }
        return true;
    }

    hasChanged(nextProps:Props): boolean {
        let oldRefKeys = this.refKeys;
        if (!oldRefKeys) return true;

        let nextRefKeys = this.makeRefObject(nextProps);

        let refKeys = this.getRefKeys(nextProps);

        for (let i = 0; i < refKeys.length; i++) {
            let refKey = refKeys[i];
            // $FlowFixMe
            if (oldRefKeys[refKey] !== nextRefKeys[refKey]) return true;
        }
        return false;

    }


    makeRefObject(nextProps:Props) {
        let refKeys = this.getRefKeys(nextProps);

        return refKeys.reduce((res, key)=> {
            // $FlowFixMe
            res[key] = _.get(nextProps, key);
            return res;
        }, {});
    }

    getRefKeys(nextProps: Props) {
        let activityType = sanitizeActivityType(nextProps.activityType);
        let base = `data.${activityType}.${nextProps.activityId}`;
        return [base, `${base}.meta`];
    }

    getActivity() {
        return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }
}
