// @flow

import type {Node} from 'react';
import React from 'react';
import {Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import FriendCell from "../components/FriendCell";
import Feed from "../components/feed"
import type {Id, Item, User} from "../../types";
import {buildData, doDataMergeInState} from "../../helpers/DataUtils";
import Screen from "../components/Screen";
import GTouchable from "../GTouchable";
import {seeUser} from "../Nav";
import {LINEUP_PADDING, STYLES} from "../UIStyles"
import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions";


type Props = {
    userId: Id,
    navigator:any,
    renderItem:?(item:Item)=>Node,

    onPressItem?: (item: User)=>void,
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
        } = this.props;


        let user: User = buildData(this.props.data, "users", userId);

        let friends, callFactory, action;
        if (user && user.friends) {
            friends = user.friends;
            callFactory = () => userActions.fetchFriendsCall(userId);
            action = userActionTypes.LOAD_FRIENDS;
        }
        else {
            friends = [];
            callFactory = () => userActions.getUserAndTheirFriends(userId);
            action = userActionTypes.GET_USER_W_FRIENDS;
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
                    visibility={this.getVisibility()}
                />
        );
    }

    renderItem(item: Item) : Node {
        let user = buildData(this.props.data, "users", item.id);
        return (
            <GTouchable onPress={()=> {seeUser(this.props.navigator, user)}}>
                <FriendCell friend={user} containerStyle={{paddingHorizontal: LINEUP_PADDING, paddingVertical: 10}}/>
            </GTouchable>
        )
    }
}


export const reducer =  (state = {}, action = {}) => {

    switch (action.type) {
        case userActionTypes.LOAD_FRIENDS.success(): {
            let {userId, mergeOptions} = action.options;
            let path = `users.${userId}.relationships.friends.data`;
            state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
            break;
        }
    }
    return state;
};
