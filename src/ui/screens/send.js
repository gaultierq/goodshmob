// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Dispatchee, Item, RequestState, User} from "../../types"
import FriendsFeed from "./friends"
import {LINEUP_PADDING} from "../UIStyles"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import PersonRowI from "../activity/components/PeopleRow"
import GButton from "../components/GButton"
import * as Api from "../../managers/Api"
import {Colors} from "../colors"
import {renderTextAndDots} from "../UIComponents"

type Props = {
    data?: any,
    navigator?:any,
    sendAction: (friend: User, description?: string) => Dispatchee
};

type State = {
    message: string,
    reqSendFriend: { Id?: RequestState}
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@logged
@connect(mapStateToProps)
export default class SendScreen extends Component<Props, State> {

    state = {
        message: "",
        reqSendFriend: {}
    };

    render() {
        const {navigator} = this.props;

        return (
            <KeyboardAwareScrollView
                contentContainerStyle={{flex:1}}
                scrollEnabled={false}
                keyboardShouldPersistTaps='always'
            >

                <FriendsFeed
                    userId={currentUserId()}
                    navigator={navigator}
                    renderItem={(friend) => this.renderItem(friend)}
                    ListHeaderComponent={
                        <TextInput
                            style={{
                                fontSize: 22,
                                margin: LINEUP_PADDING,
                            }}
                            onChangeText={message => this.setState({message})}
                            placeholder={i18n.t("send_screen.add_description_placeholder")}
                            multiline={true}
                            autoFocus={true}
                            numberOfLines={3}
                        />
                    }
                />

            </KeyboardAwareScrollView>
        )
    }

    renderItem({item}) {
        if (!item) return null

        return (
            <PersonRowI
                person={item}
                key={item.id}
                style={{
                    margin: LINEUP_PADDING
                }}
                rightComponent={this.rightComp(item)}
            />
        )
    }

    rightComp(friend: User) {
        let id = friend.id
        let req = this.state.reqSendFriend[id]
        const style = {fontSize: 16, color: Colors.brownishGrey}

        if (req === "ok") return  <Text style={style}>{i18n.t("send_screen.actions.send_ok")}</Text>
        if (req === "ko") return <GButton text={i18n.t('send_screen.actions.send_ko')} onPress={() => this._sendTo(friend)}/>
        if (req === "sending") return renderTextAndDots(i18n.t('send_screen.actions.sending'), style)
        return <GButton text={i18n.t('actions.send')} onPress={() => this._sendTo(friend)}/>
    }

    _sendTo = (friend: User) => {
        let id = friend.id

        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            this.props.sendAction(friend, this.state.message),
            `reqSendFriend.[${id}]`
        )
    }


}


