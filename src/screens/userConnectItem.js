// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {connect} from "react-redux";
import type {NavigableProps, User} from "../types";
import {currentUserId} from "../CurrentUser";
import Button from 'apsl-react-native-button'
import * as Api from "../utils/Api";
import ApiAction from "../utils/ApiAction";
import * as UI from "./UIStyles";
import UserRowI from "../activity/components/UserRowI";
;

type Props = NavigableProps & {
    user: User
};

type State = {
    connect: number,
    disconnect: number,
};

@connect()
export default class UserConnectItem extends Component<Props, State> {

    state : State = {connect: 0, disconnect: 0};

    render() {
        let item = this.props.user;
        return <UserRowI user={item}
                         navigator={this.props.navigator}
                         rightComponent={this.renderConnectButton(item)}
                         style={styles.userRow}
        />;
    }

    renderConnectButton(user: User) {
        let connect = this.state.connect;
        let disconnect = this.state.disconnect;

        let alreadyFriends = !!_.find(user.friends, (f)=>f.id === currentUserId());

        if (alreadyFriends) {
            //return <Text style={{position: 'absolute', right: 12}}>amis</Text>
            return (<Button
                isLoading={disconnect === 1}
                isDisabled={disconnect === 2}
                onPress={()=> this.disconnectWith(user)}
                style={[{position: 'absolute', right: 12}, styles.button]}
                disabledStyle={styles.disabledButton}
            >
                <Text>Se déconnecter</Text>
            </Button>);
        }

        return (<Button
            isLoading={connect === 1}
            isDisabled={connect === 2}
            onPress={()=> this.connectWith(user)}
            style={[{position: 'absolute', right: 12}, styles.button]}
            disabledStyle={styles.disabledButton}
        >
            <Text>Se connecter</Text>
        </Button>);

    }

    connectWith(user: User) {
        if (this.state.connect === 1) return;

        let setReq =  (connect) => {
            this.setState({connect});
        };


        setReq(1);
        this.props.dispatch(actions.createFriendship(user.id)
            .disptachForAction2(CONNECT))
            .then(() => {
                setReq(2);
            }, err => {
                console.error(err);
                setReq(3);
            })
    }

    disconnectWith(user: User) {
        if (this.state.disconnect === 1) return;

        let setReq =  (disconnect) => {
            this.setState({disconnect});
        };


        setReq(1);
        this.props.dispatch(actions.deleteFriendship(user.id)
            .disptachForAction2(DISCONNECT))
            .then(() => {
                setReq(2);
            }, err => {
                console.error(err);
                setReq(3);
            })
    }
}


const styles = StyleSheet.create({
    button: {
        padding: 8,
        height: 30,
    },
    disabledButton: {
        borderColor: UI.Colors.grey1,
    },
    userRow: {
        margin: 12
    }
});

export const CONNECT = new ApiAction("connect");
export const DISCONNECT = new ApiAction("disconnect");

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
