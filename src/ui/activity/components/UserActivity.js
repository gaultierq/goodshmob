// @flow

import type {Node} from 'react'
import React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import * as TimeUtils from '../../../helpers/TimeUtils'
import type {User} from "../../../types"
import {ViewStyle} from "../../../types"
import {Colors} from "../../colors"
import PersonRowI from "./PeopleRow"

type Props = {
    activityTime: string,
    user: User,
    children?: Node,
    style?: ViewStyle
};

type State = {
};

export default class UserActivity extends React.Component<Props, State> {

    render() {
        const {
            activityTime,
            user,
            ...attributes
        } = this.props;

        return (
            <PersonRowI
                person={user}
                rightComponent={this.right(activityTime)}
                {...attributes}
            />
        )
    }

    right(activityTime: string) {
        let text= activityTime ? TimeUtils.timeSince(Date.parse(activityTime)):'';
        return (
            !!text && <Text style={[styles.userText]}>{text}</Text>
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
