// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as TimeUtils from '../../../helpers/TimeUtils'
import type {User} from "../../../types";
import {Colors} from "../../colors";
import UserRowI from "./UserRowI";

type Props = {
    activityTime: string,
    user: User,
    children?: Node,
    style?: any
};

type State = {
};

export default class UserActivity extends React.Component<Props, State> {

    render() {
        const {
            activityTime,
            ...attributes
        } = this.props;



        return <UserRowI
            rightComponent={this.extracted(activityTime)}
            {...attributes}
        />
    }

    extracted(activityTime) {
        let text= activityTime ? TimeUtils.timeSince(Date.parse(activityTime)):'';
        return (
            !!text && <View style={{flex: 1, alignSelf: 'center', justifyContent: 'flex-end'}}>
                <Text style={[styles.userText, {alignSelf: 'flex-end'}]}>{text}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    userText: {
        fontSize: 10,
        lineHeight: 10,
        alignSelf: 'center',

        color: Colors.greyish,
        marginLeft: 4
    }
});
