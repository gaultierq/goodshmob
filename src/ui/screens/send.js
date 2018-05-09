// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Dispatchee, Id, Item, User} from "../../types";
import FriendsFeed from "./friends";
import FriendCell from "../components/FriendCell";
import * as UI from "../UIStyles";
import SmartInput from "../components/SmartInput";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {MainBackground, TRANSPARENT_SPACER} from "../UIComponents";
import GTouchable from "../GTouchable";
import {userFirstName} from "../../helpers/StringUtils";
import {sendMessage} from "../../managers/Messenger"

type Props = {
    data?: any,
    navigator?:any,
    sendAction: (friend: User, description?: string) => Dispatchee
};

type State = {
    sent: {[Id]: string},
    selected?: Id
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@logged
@connect(mapStateToProps)
export default class SendScreen extends Component<Props, State> {

    state = {
        sent: {},
    };

    render() {
        const {navigator, sendAction} = this.props;

        return (
            <MainBackground>
                <KeyboardAwareScrollView
                    contentContainerStyle={{flex:1}}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='always'
                >
                    <FriendsFeed
                        userId={currentUserId()}
                        navigator={navigator}
                        renderItem={(friend) => this.renderItem(friend)}
                        ItemSeparatorComponent={TRANSPARENT_SPACER(16)}
                    />

                </KeyboardAwareScrollView>
            </MainBackground>
        )
    }

    renderItem(friend: Item) : Node {

        let id = friend.id;

        let sent : boolean = id in this.state.sent;

        let isSelected = id === this.state.selected;
        return (
            <GTouchable
                disabled={sent}
                onPress={()=>this.setState({selected: isSelected ? null : id})}>
                <FriendCell
                    containerStyle={{padding: 16}}
                    friend={friend}
                    childrenBelow={!sent}
                >
                    {
                        this.renderChildren(isSelected, sent, friend)
                    }
                </FriendCell>
            </GTouchable>
        )
    }

    renderChildren(isSelected: boolean, sent: boolean, friend: User) {
        return isSelected &&
            <View style={{flex: 1}}>
                <SmartInput
                    containerStyle={{
                        paddingVertical: 6,
                        // backgroundColor: 'red'
                    }}
                    inputStyle={{
                        fontSize: 15
                    }}
                    // inputContainerStyle={{borderRadius: 1}}
                    execAction={(input: string) => {
                        return this.props.dispatch(this.props.sendAction(friend, input))
                            .then((info, err)=> {
                                sendMessage(i18n.t('send_screen.sent'));
                            });
                    }}
                    placeholder={i18n.t("send_screen.add_description_placeholder", {recipient: userFirstName(friend)})}
                    autoFocus
                    height={35}
                    numberOfLines={1}
                    canSendDefault={true}
                    returnKeyType={'send'}
                />
            </View>;
    }

}
