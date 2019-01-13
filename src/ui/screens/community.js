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
import {LINEUP_PADDING, SIMPLE_BUTTON_TEXT_STYLE, STYLES} from "../UIStyles"
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

    constructor(props: Props){
        super(props);
        props.navigator.setButtons({
            rightButtons: [{
                id: 'friendsSearch',
                icon: require('../../img2/search.png'),
            }]
        })
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event: any) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'friendsSearch') {
                this.props.navigator.push({
                    screen: 'goodsh.UserSearchScreen',
                    title: i18n.t("search.in_users")
                });
            }
        }
    }

    render() {
        return (
            <FriendsList
                userId={currentUserId()}
                navigator={this.props.navigator}
                ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t('friends.empty_screen')}</Text>}
                ListHeaderComponent={
                    <View>
                        <GTouchable style={{margin: LINEUP_PADDING, flexDirection: 'row',alignItems: 'center',}} onPress={
                            () => {
                                this.props.navigator.push({
                                    screen: 'goodsh.InviteManyContacts',
                                    // navigatorButtons: CANCELABLE_MODAL,
                                    title: i18n.t('invite_contacts'),
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
