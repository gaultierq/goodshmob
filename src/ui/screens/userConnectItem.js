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
    View
} from 'react-native';
import {connect} from "react-redux";
import type {NavigableProps, RequestState, User} from "../../types";
import {currentUserId} from "../../CurrentUser";
import * as Api from "../../utils/Api";
import ApiAction from "../../utils/ApiAction";
import {renderSimpleButton} from "../UIStyles";
import UserRowI from "../activity/components/UserRowI";
import {Colors} from "../colors";


type Props = NavigableProps & {
    user: User
};

type State = {
    connect?: RequestState,
    disconnect?: RequestState,
};

@connect()
export default class UserConnectItem extends Component<Props, State> {

    state : State = {};

    render() {
        let item = this.props.user;
        return <UserRowI user={item}
                         navigator={this.props.navigator}
                         rightComponent={this.renderConnectButton(item)}
                         style={styles.userRow}
        />;
    }

    renderConnectButton(user: User) {

        let alreadyFriends = !!_.find(user.friends, (f)=>f.id === currentUserId());
        let remainingAction = alreadyFriends ? 'disconnect' : 'connect';
        let reqState = this.state[remainingAction];


        let ok = reqState === 'ok';

        return <View style={{position: 'absolute', right: 0, alignItems: 'center'}}>{
            renderSimpleButton(
                i18n.t(`friends.` + (ok ? 'messages' : 'buttons') + `.${remainingAction}`),
                alreadyFriends ? ()=> this.disconnectWith(user) : ()=> this.connectWith(user),
                {loading: reqState === 'sending', disabled: ok, textStyle: {fontWeight: "normal", fontSize: 16, }}
            )
        }</View>
    }

    connectWith(user: User) {
        let action = actions.createFriendship(user.id).disptachForAction2(CONNECT);
        Api.safeDispatchAction.call(this, this.props.dispatch, action, 'connect');
    }

    disconnectWith(user: User) {

        let action = actions.deleteFriendship(user.id).disptachForAction2(DISCONNECT);
        Api.safeDispatchAction.call(this, this.props.dispatch, action, 'disconnect');
    }
}


const styles = StyleSheet.create({
    button: {
        padding: 8,
        height: 30,
    },
    disabledButton: {
        borderColor: Colors.grey1,
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
