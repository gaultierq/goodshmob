// @flow

import React, {Component} from 'react';
import type {Node} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import type {Id, Item, User} from "../types";
import FriendsFeed from "./friends";
import FriendCell from "./components/FriendCell";
import Button from 'apsl-react-native-button'
import ApiAction from "../utils/ApiAction";
import type {Description, Visibility} from "./save";
import * as Api from "../utils/Api";
import * as UI from "./UIStyles";

type Props = {
    userId: Id,
    item: Item,
    data?: any,
    navigator?:any
};

type State = {
    statuses: any
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@connect(mapStateToProps)
export default class SendScreen extends Component<Props, State> {

    state = {
        statuses: {}
    };

    render() {
        const {navigator, userId, item} = this.props;

        return (
            <FriendsFeed
                userId={userId}
                navigator={navigator}
                renderItem={(friend) => this.renderItem(friend)}
            />
        )
    }

    renderItem(friend: Item) : Node {
        return (
            <FriendCell
                friend={friend}
                onPressItem={this.props.onPressItem}
                children={this.renderButton(friend)}
            />
        )
    }

    renderButton(friend: User) : Node {
        let {statuses} = this.state;
        let status = statuses[friend.id] || 'idle';

        let buttonText;
        switch (status) {
            case 'idle':
                buttonText = "Envoyer";
                break;
            case 'sending':
                buttonText = "envoi...";
                break;
            case 'sent':
                buttonText = "Envoyé";
                break;
            case 'fail':
                buttonText = "Réessayer";
                break;


        }
        let sent = status === 'sent';
        let sending = status === 'sending';
        return (
            <Button
                isLoading={sending}
                isDisabled={sent}
                onPress={()=> this.sendIt(friend)}
                style={styles.button}
                disabledStyle={styles.disabledButton}
            >
                <Text style={{color: sent ? UI.Colors.grey1 : UI.Colors.black}}>{buttonText}</Text>
            </Button>);

    }

    sendIt(friend: User)  {


        let setStat = (stat) => {
            this.setState(
                {
                    statuses: {
                        ...this.state.statuses,
                        [friend.id]: stat}
                }
            )
        };

        setStat('sending');
        let disptachForAction2 = actions.sendItem(/*id*/this.props.item, friend).disptachForAction2(SEND_ITEM);
        this.props.dispatch(disptachForAction2)
            .then(()=> {
                setStat('sent');
            })
            .catch(()=> {
                setStat('fail');
            });
    }

}

const SEND_ITEM = new ApiAction("send_item");


const actions = (() => {
    return {
        sendItem: (item: Item, user: User, description?: Description = "", privacy?: Visibility = 0) => {

            let body = {
                sending: {
                    receiver_id: user.id,
                    description,
                    privacy
                }
            };

            return new Api.Call().withMethod('POST')
                .withRoute(`items/${item.id}/sendings`)
                .withBody(body)
                .addQuery({
                    include: "*.*"
                });
        },
    };
})();

const styles = StyleSheet.create({
    button: {
        padding: 8,
        height: 30,
    },
    disabledButton: {
        borderWidth: 0,
    }
});

