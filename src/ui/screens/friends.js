// @flow

import type {Node} from 'react';
import React from 'react';
import {Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import FriendCell from "../components/FriendCell";
import ShareButton from "../components/ShareButton";
import * as Api from "../../managers/Api";
import Feed from "../components/feed"
import ApiAction from "../../helpers/ApiAction";
import type {Id, Item, User} from "../../types";
import {buildData, doDataMergeInState} from "../../helpers/DataUtils";
import Screen from "../components/Screen";
import GTouchable from "../GTouchable";
import * as Nav from "../Nav";
import {STYLES} from "../UIStyles";
import {seeUser} from "../Nav";

;

type Props = {
    userId: Id,
    navigator:any,
    renderItem:?(item:Item)=>Node,

    onPressItem:? (item: User)=>void,
    data?: any,
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@logged
@connect(mapStateToProps)
export default class FriendsScreen extends Screen<Props, State> {

    render() {

        const {
            userId,
            renderItem,
            ItemSeparatorComponent,
            data,
            ...attributes //not accepted...
        } = this.props;


        let user: User = buildData(this.props.data, "users", userId);

        let friends, callFactory, action;
        if (user && user.friends) {
            friends = user.friends;
            callFactory = () => actions.fetchFriendsCall(userId);
            action = actionTypes.LOAD_FRIENDS;
        }
        else {
            friends = [];
            callFactory = () => actions.getUserAndTheirLists(userId);
            action = actionTypes.GET_USER;
        }

        return (
                <Feed
                    data={friends}
                    renderItem={({item}) => (renderItem||this.renderItem.bind(this))(item)}
                    fetchSrc={{
                        callFactory,
                        action,
                        options: {userId}
                    }}
                    empty={<Text style={STYLES.empty_message}>{i18n.t('friends.empty_screen')}</Text>}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    {...attributes}
                    // cannotFetch={!super.isVisible()}
                />
        );
    }

    renderItem(item: Item) : Node {
        let user = buildData(this.props.data, "users", item.id);
        return (
            <GTouchable onPress={()=> {seeUser(this.props.navigator, user)}}>
                <FriendCell friend={user} containerStyle={{padding: 16}}/>
            </GTouchable>
        )
    }
}

const actionTypes = (() => {

    const LOAD_FRIENDS = ApiAction.create("load_friends", "retrieve user friends details");
    const GET_USER_W_FRIENDS = ApiAction.create("get_user_w_friends", "get the user friends list");

    return {LOAD_FRIENDS, GET_USER: GET_USER_W_FRIENDS};
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
        getUserAndTheirLists: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "friends"
                }
            ),
    };
})();

export const reducer =  (state = {}, action = {}) => {

    switch (action.type) {
        case actionTypes.LOAD_FRIENDS.success(): {
            let {userId, mergeOptions} = action.options;
            let path = `users.${userId}.relationships.friends.data`;
            state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
            break;
        }
    }
    return state;
};
