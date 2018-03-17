// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {CachedImage} from "react-native-img-cache";
import type {Id, User} from "../../types";
import {fullName} from "../../helpers/StringUtils";
import {SFP_TEXT_MEDIUM} from "../fonts";


type Props = {
    user: User
};

type State = {
};

//TODO: merge with MyAvatar
export default class UserNav extends Component<Props, State> {

    render() {

        let imageDim = 32;

        const user = this.props.user;

        return (
            <View style={{
                flex:1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'}
            }>
                <CachedImage
                    source={{uri: user && user.image || ""}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                    }}
                />
                <Text style={{
                    fontSize: 17,
                    fontFamily: SFP_TEXT_MEDIUM,
                    marginLeft: 8,
                }}>{fullName(user)}</Text>
            </View>
        )

    }
}
