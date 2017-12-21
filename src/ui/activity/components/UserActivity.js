// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as TimeUtils from '../../../helpers/TimeUtils'
import type {User} from "../../../types";
import UserRow from "./UserRow";

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

        return <UserRow
            text={activityTime ? TimeUtils.timeSince(Date.parse(activityTime)):''}
            {...attributes}
        />
    }
}