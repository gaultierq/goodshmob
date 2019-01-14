// @flow

import React, {Component} from 'react'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import Feed from "../components/feed"
import {Avatar} from "react-native-elements"
import {GAvatar} from "../GAvatar"
import {reduceList2} from "../../managers/Api"
import {FETCH_LAST_ACTIVE_USERS, fetchLastActiveUsers} from "../networkActions"
import {Colors} from "../colors"
import {Image, Text, View} from "react-native"
import {createStructuredSelector} from "reselect"
import type {Id, User} from "../../types"
import {LAST_ACTIVE_USERS_SELECTOR} from "../../helpers/Selectors"


const logger = rootlogger.createLogger('last_active_users')

@logged
@connect(() => createStructuredSelector(
    {
        lastActiveUsers: LAST_ACTIVE_USERS_SELECTOR(),
    }
))
export default class LastActiveUsers extends Component<{userId: Id, style?: any, lastActiveUsers?: User[]}, {}> {

    render() {
        const {lastActiveUsers, userId, ...attr} = this.props
        return (
            <View style={[{flex:1}, this.props.style]}>
                <Feed
                    data={lastActiveUsers}
                    displayName={"last_active_users"}
                    renderItem={({item, index}) => <GAvatar person={item} size={50} seeable />}
                    ItemSeparatorComponent={()=> <View style={{margin: 4}} />}
                    hasMore={false}
                    horizontal
                    fetchSrc={{
                        callFactory: () => fetchLastActiveUsers(userId),
                        // useLinks: true,
                        action: FETCH_LAST_ACTIVE_USERS,
                        options: {userId},
                        // onFetch: this.onFetch.bind(this)
                    }}
                    style={{backgroundColor: Colors.greying}}
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
