// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Id, Item, User} from "../../types";
import FriendsFeed from "./friends";
import FriendCell from "../components/FriendCell";
import ApiAction from "../../helpers/ApiAction";
import type {Description, Visibility} from "./save";
import * as Api from "../../managers/Api";
import * as UI from "../UIStyles";
import SmartInput from "../components/SmartInput";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {MainBackground} from "../UIComponents";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";

type Props = {
    itemId: Id,
    data?: any,
    navigator?:any
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


    constructor(props: Props) {
        super(props);
        ensureNotNull(props.itemId);
    }

    render() {
        const {navigator} = this.props;

        return (
            <MainBackground>
                <KeyboardAwareScrollView
                    contentContainerStyle={{flex:1}}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps={true}
                >
                    <FriendsFeed
                        userId={currentUserId()}
                        navigator={navigator}
                        renderItem={(friend) => this.renderItem(friend)}
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
            <View>
                <GTouchable
                    disabled={sent}
                    onPress={()=>this.setState({selected: isSelected ? null : id})}>
                    <FriendCell
                        friend={friend}
                        childrenBelow={!sent}
                    >
                        {
                            this.renderChildren(isSelected, sent, friend)
                        }
                    </FriendCell>
                </GTouchable>
            </View>
        )
    }

    renderChildren(isSelected: boolean, sent: boolean, friend: User) {
        if (sent) return <Text style={UI.TEXT_LESS_IMPORTANT}>{i18n.t("send_screen.sent")}</Text>
        return isSelected &&
            <View style={{flex: 1}}>
                <SmartInput
                    containerStyle={{padding: 6}}
                    inputStyle={{fontSize: 15}}
                    inputContainerStyle={{borderRadius: 1}}
                    execAction={(input: string) => this.sendIt2(friend, input)}
                    placeholder={"send_screen.add_description_placeholder"}
                    multiline
                    height={30}
                    canSendDefault={true}
                    returnKeyType={'send'}
                />
            </View>;
    }

    sendIt2(friend: User, description: string)  {
        return this.props
            .dispatch(actions.sendItem(this.props.itemId, friend, description)
                .disptachForAction2(SEND_ITEM)).then(()=> {
                this.setState({sent: {...this.state.sent, [friend.id]: description}});

            });
    }

}

const SEND_ITEM = ApiAction.create("send_item");


const actions = (() => {
    return {
        sendItem: (itemId: Id, user: User, description?: Description = "", privacy?: Visibility = 0) => {

            let body = {
                sending: {
                    receiver_id: user.id,
                    description,
                    privacy
                }
            };

            return new Api.Call().withMethod('POST')
                .withRoute(`items/${itemId}/sendings`)
                .withBody(body)
                .addQuery({
                    include: "*.*"
                });
        },
    };
})();

const styles = StyleSheet.create({
    button: {
        height: 30,
        width: 100,
        borderWidth: 0
    },
    input:{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyishBrown,
        borderRadius: 20
    },
    disabledButton: {
        borderWidth: 0,
    }
});

