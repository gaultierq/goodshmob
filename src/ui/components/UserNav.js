// @flow
import React, {Component} from 'react'
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Navigation} from 'react-native-navigation'
import type {User} from "../../types"
import {fullName} from "../../helpers/StringUtils"
import {SFP_TEXT_MEDIUM} from "../fonts"
import {GAvatar} from "../GAvatar"


type Props = {
    user: User
};

type State = {
};

//TODO: merge with MyAvatar
export default class UserNav extends Component<Props, State> {

    render() {

        let imageDim = 30

        const user = this.props.user;

        return (
            <View style={{
                flex:1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'}
            }>
                <GAvatar person={user} size={imageDim}/>

                <Text style={{
                    fontSize: 20,
                    fontFamily: SFP_TEXT_MEDIUM,
                    marginLeft: 12,
                }}>{fullName(user)}</Text>
            </View>
        )

    }
}
