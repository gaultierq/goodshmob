// @flow

import React from 'react'
import {
    ActivityIndicator,
    FlatList, Image,
    Keyboard,
    Platform,
    RefreshControl, Share,
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
import Ionicons from "react-native-vector-icons/Ionicons"

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
                        {this.renderShareApp()}
                        <FeedSeparator/>

                        {this.renderInviteContacts()}


                        <FeedSeparator/>


                        <Text style={{
                            ...STYLES.SECTION_TITLE,
                            paddingVertical: 8,
                            paddingHorizontal: LINEUP_PADDING
                        }}>{i18n.t('my_connections')}</Text>
                    </View>
                }
            />
        )
    }

    renderInviteContacts() {
        return <GTouchable style={{margin: LINEUP_PADDING, flexDirection: 'row', alignItems: 'center',}} onPress={
            () => {
                this.props.navigator.push({
                    screen: 'goodsh.InviteManyContacts',
                    // navigatorButtons: CANCELABLE_MODAL,
                    title: i18n.t('invite_contacts'),
                })
            }
        }>
            <View style={styles.headerIconWrapper}>
                <Ionicons name="ios-person-add" size={46} color={Colors.orange}/>
            </View>
            <Text style={[styles.headerButtonText, {marginLeft: 12}]}>{i18n.t('invite_contacts')}</Text>
        </GTouchable>
    }

    renderShareApp() {
        return <GTouchable style={{margin: LINEUP_PADDING, flexDirection: 'row', alignItems: 'center',}} onPress={
            () => {
                let message = i18n.t('share_goodsh.message');
                let title = i18n.t('share_goodsh.title');

                let intent = {
                    message,
                    title
                };

                Share.share(intent, {
                    dialogTitle: title,
                });
            }
        }>
            <Text style={[styles.headerButtonText, {marginRight: 5}]}>{i18n.t('share_app')}</Text>
            <Image source={require('../../img2/goodsh-it.png')} resizeMode="contain" style={{width: 95, marginTop: 3}}/>
            <Text style={[styles.headerButtonText, {marginLeft: 5}]}>{i18n.t('with_your_friends')}</Text>
        </GTouchable>
    }
}



const styles = StyleSheet.create({
    headerButtonText: {
        fontFamily: SFP_TEXT_MEDIUM, fontSize: 20
    },
    headerIconWrapper: {
        borderWidth: 3,
        borderColor: Colors.orange,
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
    },

})
