// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Dispatchee, Id, Item, User} from "../../types"
import FriendsFeed from "./friends"
import FriendCell from "../components/FriendCell"
import * as UI from "../UIStyles"
import {LINEUP_PADDING} from "../UIStyles"
import SmartInput from "../components/SmartInput"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {MainBackground, TRANSPARENT_SPACER} from "../UIComponents"
import GTouchable from "../GTouchable"
import {userFirstName} from "../../helpers/StringUtils"
import {Colors} from "../colors"
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import PersonRowI from "../activity/components/PeopleRow"

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
                    contentContainerStyle={{padding: LINEUP_PADDING, flex:1}}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='always'
                >
                    <FriendsFeed
                        userId={currentUserId()}
                        navigator={navigator}
                        renderItem={(friend) => this.renderItem(friend)}
                        ItemSeparatorComponent={TRANSPARENT_SPACER()}
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
                <View>
                    <PersonRowI person={friend} style={{margin: 16}}/>
                    {
                        !sent && this.renderInput(isSelected, sent, friend)
                    }
                </View>
            </GTouchable>
        )
    }

    renderInput(isSelected: boolean, sent: boolean, friend: User) {
        if (sent) return <Text style={UI.TEXT_LESS_IMPORTANT}>{i18n.t("send_screen.sent")}</Text>
        return isSelected &&
            <View style={{flex: 1}}>
                <SmartInput
                    containerStyle={{
                        paddingVertical: 6,
                        // backgroundColor: 'red'
                    }}
                    inputStyle={{
                        fontSize: 16
                    }}
                    // inputContainerStyle={{borderRadius: 1}}
                    execAction={(input: string) => {
                        return this.props.dispatch(this.props.sendAction(friend, input))
                            .then((info, err)=> {
                                const targetId = info.data.relationships.target.data.id;
                                let sent = this.state.sent;
                                sent[targetId] = true;
                                this.setState({sent})
                            });
                    }}
                    placeholder={i18n.t("send_screen.add_description_placeholder", {recipient: userFirstName(friend)})}
                    autoFocus
                    height={35}
                    numberOfLines={1}
                    canSendDefault={true}
                    returnKeyType={'send'}
                    button={<MaterialIcons name="send" size={28} color={Colors.greyishBrown} />}
                />
            </View>;
    }

}
