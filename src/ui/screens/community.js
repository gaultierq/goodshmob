// @flow

import React from 'react'
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import {ViewStyle} from "../../types"
import FriendsScreen from "./friends"
import Screen from "../components/Screen"
import ShareButton from "../components/ShareButton"
import {BACKGROUND_COLOR} from "../UIStyles"

type Props = {
    navigator:any,
    style?: ViewStyle
};

type State = {
};

@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
export class CommunityScreen extends Screen<Props, State> {

    render() {
        return (
            <View style={{backgroundColor: BACKGROUND_COLOR}}>
            <FriendsScreen
                userId={currentUserId()}
                navigator={this.props.navigator}
                ListHeaderComponent={<ShareButton text={i18n.t('actions.invite')}/>}
            />
            </View>
        )
    }
}
