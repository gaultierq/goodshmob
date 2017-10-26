// @flow

import React, {Component} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {connect} from "react-redux";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "./UIComponents";
import * as Api from "../utils/Api";
import Feed from "./components/feed"
import ApiAction from "../utils/ApiAction";
import type {Id, User} from "../types";
import {buildData} from "../utils/DataUtils";

type Props = {
    userId: Id,
    onPressItem:? (item: User)=>void,
    data?: any
};

type State = {
};
class CommunityScreen extends Component<Props, State> {


    render() {

        const {userId} = this.props;

        let user: User = buildData(this.props.data, "users", userId);

        let friends, callFactory, action;
        if (user && user.friends) {
            friends = user.friends;
            callFactory = () => actions.fetchFriendsCall(userId);
            action = actionTypes.LOAD_FRIENDS;
        }
        else {
            friends = [];
            callFactory = () => actions.getUser(userId);
            action = actionTypes.GET_USER;
        }

        return (
            <MainBackground>
                <View style={styles.container}>
                    <Feed
                        data={friends}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory,
                            action
                        }}
                        hasMore={false}
                    />
                </View>
            </MainBackground>
        );
    }


    renderItem({item}) {
        const {onPressItem} = this.props;
        return (
            <TouchableOpacity
                onPress={onPressItem}>
                <FriendCell
                    friend={item}
                    onPressItem={this.props.onPressItem}
                />
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    friend: state.friend,
    data: state.data,
});


const actionTypes = (() => {

    const LOAD_FRIENDS = new ApiAction("load_friends");
    const GET_USER = new ApiAction("get_user");

    return {LOAD_FRIENDS, GET_USER};
})();


const actions = (() => {
    return {
        fetchFriendsCall: (userId: string) => {

            return new Api.Call().withMethod('GET')
                .withRoute(`users/${userId}/friends`)
                .addQuery({
                    include: "creator"
                });
        },
        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "friends"
                }
            ),
    };
})();


let screen = connect(mapStateToProps)(CommunityScreen);

export {screen};
