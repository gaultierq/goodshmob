// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {NavigableProps, RequestState, User} from "../../types";
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import {renderSimpleButton} from "../UIStyles";
import UserRowI from "../activity/components/UserRowI";
import {Colors} from "../colors";
import _Messenger from "../../managers/Messenger";


type Props = NavigableProps & {
    user: User
};

type State = {
    connect?: RequestState,
    disconnect?: RequestState,
};

@connect()
@logged
export default class UserConnectItem extends Component<Props, State> {

    state : State = {};

    render() {
        let item = this.props.user;
        return (
            <View style={{flex: 1, flexDirection: 'row'}}>
                <UserRowI user={item}
                    navigator={this.props.navigator}
                    //rightComponent={this.renderConnectButton(item)}
                    style={styles.userRow}
                />
                {this.renderConnectButton(item)}
            </View>
        )
    }

    renderConnectButton(user: User) {

        let alreadyFriends = !!_.find(user.friends, (f)=>f.id === currentUserId());
        let remainingAction = alreadyFriends ? 'disconnect' : 'connect';
        let reqState = this.state[remainingAction];


        let ok = reqState === 'ok';

        return <View style={{ alignItems:'flex-end', justifyContent: 'center', paddingHorizontal: 10}}>{
            renderSimpleButton(
                i18n.t(`friends.` + (ok ? 'messages' : 'buttons') + `.${remainingAction}`),
                alreadyFriends ? ()=> this.disconnectWith(user) : ()=> this.connectWith(user),
                {loading: reqState === 'sending', disabled: ok, textStyle: {fontWeight: "normal", fontSize: 14, color: Colors.grey}}
            )
        }</View>
    }

    connectWith(user: User) {
        let action = actions.createFriendship(user.id).disptachForAction2(CONNECT);
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            action,
            'connect'
        ).then(()=> {
                _Messenger.sendMessage(i18n.t("friends.messages.connect"));
            }
        );
    }

    disconnectWith(user: User) {
        Alert.alert(
            i18n.t("friends.alert.title"),
            i18n.t("friends.alert.label"),
            [
                {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: i18n.t("actions.ok"), onPress: () => {
                    let action = actions.deleteFriendship(user.id).disptachForAction2(DISCONNECT);
                    Api.safeDispatchAction.call(
                        this,
                        this.props.dispatch,
                        action,
                        'disconnect'
                    ).then(()=> {
                            _Messenger.sendMessage(i18n.t("friends.messages.disconnect"));
                        }
                    );
                }},
            ],
            { cancelable: true }
        )
    }
}


const styles = StyleSheet.create({
    button: {
        padding: 8,
        height: 30,
    },
    disabledButton: {
        borderColor: Colors.greyishBrown,
    },
    userRow: {
        margin: 12
    }
});

export const CONNECT = ApiAction.create("connect");
export const DISCONNECT = ApiAction.create("disconnect");

const actions = {
    createFriendship: (userId: string) => {
        return new Api.Call().withMethod('POST')
            .withRoute(`users/${userId}/friendships`);

    },

    deleteFriendship: (userId: string) => {
        return new Api.Call().withMethod('DELETE')
            .withRoute(`users/${userId}/friendships`);

    }
};
