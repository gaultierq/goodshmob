// @flow

import ApiAction from "../helpers/ApiAction"
import * as Api from "../managers/Api"
import {Call, reduceList2} from "../managers/Api"
import type {Id} from "../types"

export const FETCH_ACTIVITIES = ApiAction.create("network/fetch_activities", "retrieve the network activities");
export const FETCH_LAST_ACTIVE_USERS = ApiAction.create("network/fetch_last_active_users", "retrieve the last active users");

export type FetchActivitiesOptions = { limit?: number, activity_by_group?: number }

export function fetchMyNetwork(options?: FetchActivitiesOptions = {limit: 10}): Call {
    return new Api.Call()
        .withMethod('GET')
        .withRoute("activities")
        .addQuery({include: "activities.user,activities.resource,activities.target,activities.comments"})
        .addQuery(options)
}

export function fetchLastActiveUsers(currentUserId: Id): Call {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`users/${currentUserId}/last_active_users`)
        // .addQuery({include: "activities.user,activities.resource,activities.target,activities.comments"})
        // .addQuery(options)
}


export const reducer = (() => {

    return (state = {}, action) => {

        if (action.type === FETCH_ACTIVITIES.success()) {
            let {userId} = action.options || {};

            if (userId) {
                let subState = state[userId] || {};
                subState = reduceList2(subState, action, FETCH_ACTIVITIES/*, group => ({
                    createdAt: group.attributes['created-at'],
                    streamId: _.get(group, 'meta.stream-id')
                })*/)

                state = {...state, [userId]: subState}
            }
        }

        return state;
    }
})();
