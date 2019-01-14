// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {Image, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import Feed from "../components/feed"
import type {Id, Item, User} from "../../types"
import {doDataMergeInState} from "../../helpers/DataUtils"
import GTouchable from "../GTouchable"
import {LINEUP_PADDING, STYLES} from "../UIStyles"
import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions"
import PersonRowI from "../activity/components/PeopleRow"
import {pressToSeeUser, pressToSeeUserSheet} from "../../managers/Links"
import {createStructuredSelector} from "reselect"
import {FRIENDS_SELECTOR} from "../../helpers/Selectors"
import * as Api from "../../managers/Api"


type Props = {
    userId: Id,
    friends?: User[],
    renderItem?: (item:Item)=>Node,
}

type State = {
}

@logged
@connect(() => createStructuredSelector(
    {
        friends: FRIENDS_SELECTOR(),
    }
))
export default class FriendsList extends Component<Props, State> {

    static defaultProps = {
        renderItem: ({item}) =>
            (
                <GTouchable
                    onLongPress={pressToSeeUserSheet(item)}
                    onPress={pressToSeeUser(item)}>
                    <PersonRowI
                        person={item}
                        style={{margin: LINEUP_PADDING}}
                        rightComponent={(
                            <GTouchable style={{
                                paddingLeft: 0,
                                paddingVertical: 16,
                            }} onPress={pressToSeeUserSheet(item)}>
                                <Image source={require('../../img2/sidedots.png')} resizeMode="contain"/>
                            </GTouchable>
                        )}
                    />
                </GTouchable>
            ),
    }

    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUserAndTheirFriends(currentUserId()).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    render() {

        const {
            userId,
            friends,
            renderItem,
            ...attr
        } = this.props;

        let data = _.filter(friends, u => _.get(u, 'id') !== this.props.userId)

        return (
            <Feed
                data={data}
                renderItem={renderItem}
                fetchSrc={{
                    callFactory: () => userActions.fetchFriendsCall(userId),
                    action: userActionTypes.GET_USER_W_FRIENDS,
                    options: {userId}
                }}
                {...attr}
            />
        );
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
