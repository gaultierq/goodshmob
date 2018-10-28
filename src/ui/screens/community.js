// @flow

import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import type {NavigableProps} from "../../types"
import Screen from "../components/Screen"
import {connect} from "react-redux"
import FriendsList from "./friends"
import {currentUserId} from "../../managers/CurrentUser"
import GButton from "../components/GButton"
import {LINEUP_PADDING} from "../UIStyles"

type Props = NavigableProps & {
}

type State = {
}


@connect()
export default class CommunityScreen extends Screen<Props, State> {


    render() {
        return (
            <FriendsList
                userId={currentUserId()}
                navigator={this.props.navigator}
                ListHeaderComponent={<GButton style={{margin: LINEUP_PADDING}} text={"Inviter des contacts"} onPress={
                    () => {
                        this.props.navigator.push({
                            screen: 'goodsh.InviteManyContacts',
                            // navigatorButtons: CANCELABLE_MODAL,
                            title: "Inviter des contacts",
                        })
                    }
                }/>}
            />
        )
    }
}
