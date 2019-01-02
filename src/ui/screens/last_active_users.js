// @flow

import React, {Component} from 'react'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {NavigableProps} from "../../types"
import {buildData} from "../../helpers/DataUtils"
import Feed from "../components/feed"
import {Avatar} from "react-native-elements"
import {GAvatar} from "../GAvatar"
import {Call, reduceList2} from "../../managers/Api"
import {FETCH_LAST_ACTIVE_USERS, fetchLastActiveUsers} from "../networkActions"
import {Colors} from "../colors"
import {View} from "react-native"

type Props = NavigableProps;

type State = {
};

const logger = rootlogger.createLogger('last_active_users')

@logged
@connect((state, ownProps) => ({
    last_active_users: state.last_active_users,
    data: state.data,
}))
export default class LastActiveUsers extends Component<Props, State> {


    componentDidMount() {
    }

    render() {
        const {data, last_active_users, ...attr} = this.props
        const userId = currentUserId()
        let lui = last_active_users[userId] || {list: []}
        let items = lui.list.map(u => buildData(data, 'users', u.id))
        debugger;
        return (
            <View style={{flex:1}}>
                <Feed
                    data={items}
                    displayName={"last_active_users"}
                    renderItem={({item, index}) => <GAvatar person={item} />}
                    fetchSrc={{
                        callFactory: () => fetchLastActiveUsers(userId),
                        // useLinks: true,
                        action: FETCH_LAST_ACTIVE_USERS,
                        options: {userId},
                        // onFetch: this.onFetch.bind(this)
                    }}
                    style={{backgroundColor: Colors.greying}}
                    hasMore={false}

                    {...attr}

                />
            </View>
        )
    }
}

export const reducer = (state = {}, action) => {

    if (action.type === FETCH_LAST_ACTIVE_USERS.success()) {
        let {userId} = action.options || {};

        if (userId) {
            let subState = state[userId] || {};
            subState = reduceList2(subState, action, FETCH_LAST_ACTIVE_USERS)

            state = {...state, [userId]: subState}
        }
    }

    return state;
}
