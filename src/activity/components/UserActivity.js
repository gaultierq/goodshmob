// @flow

import type {Children} from 'react';
import React from 'react';

import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as Model from "../../models/index"
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../../screens/UIStyles";
import type {User} from "../../types";

export default class UserActivity extends React.Component {

    props: {
        activityTime: string,
        user: User,
        children: Children
    };

    render() {
        return <View style={{flex: 1, flexDirection: 'row', marginBottom: 8}}>
            <Image
                source={{uri: this.props.user ? this.props.user.image: ""}}
                style={{
                    height: 30,
                    width: 30,
                    borderRadius: 15
                }}
            />
            <View style={{flex: 1, marginLeft: 8}}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity>
                        <Text style={{
                            fontSize: 11,
                            color: UI.Colors.blue
                        }}>{this.props.user ? Model.User.fullname(this.props.user):""}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity><Text style={{
                        fontSize: 9,
                        color: UI.Colors.grey1,
                        marginLeft: 4
                    }}>{this.props.activityTime ? TimeUtils.timeSince(Date.parse(this.props.activityTime)):''}</Text></TouchableOpacity>
                </View>
                {this.props.children}

            </View>

        </View>

        {/*</View>;*/}
    }
}
