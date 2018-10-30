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
import {LINEUP_PADDING, SIMPLE_BUTTON_TEXT_STYLE} from "../UIStyles"
import GTouchable from "../GTouchable"
import Icon from 'react-native-vector-icons/Ionicons'
import {Colors} from "../colors"
import FeedSeparator from "../activity/components/FeedSeparator"
import {SFP_TEXT_MEDIUM} from "../fonts"

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
                ListHeaderComponent={
                    <View>
                        <GTouchable style={{margin: LINEUP_PADDING, flexDirection: 'row',alignItems: 'center',}} onPress={
                            () => {
                                this.props.navigator.push({
                                    screen: 'goodsh.InviteManyContacts',
                                    // navigatorButtons: CANCELABLE_MODAL,
                                    title: "Inviter des contacts",
                                })
                            }
                        }>
                            <Icon name="ios-contacts" size={50} color={Colors.orange} />
                            <Text style={[{fontFamily: SFP_TEXT_MEDIUM, fontSize: 20}, {marginLeft: 12}]}>{i18n.t('invite_contacts')}</Text>
                        </GTouchable>
                        <FeedSeparator/>
                    </View>

                }
            />
        )
    }
}
