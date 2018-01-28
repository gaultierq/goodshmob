// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {User} from "../../../types";
import UserRowI from "./UserRowI";
import {Colors} from "../../colors";

type Props = {
    user: User,
    children?: Node,
    small?: boolean,
    text?: string,
    style?: any,
    navigator: *,
    pic?: boolean,
    noImage: boolean
};

type State = {
};

export default class UserRow extends React.Component<Props, State> {

    render() {
        return <UserRowI
            {...this.props}
            rightComponent={!!this.props.text &&
            <Text style={styles.userText}>{this.props.text}
            </Text>
            }
        />
    }
}

const styles = StyleSheet.create({
    userText: {
        fontSize: 13,
        color: Colors.greyish,
        marginLeft: 4
    }
});
