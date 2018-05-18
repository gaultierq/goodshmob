// @flow

import ApiAction from "../helpers/ApiAction";
import * as Api from "../managers/Api";
import {reduceList2} from "../managers/Api";

export const FETCH_ACTIVITIES = ApiAction.create("network/fetch_activities", "retrieve the network activities");

export function fetchMyNetwork() {
    return new Api.Call()
        .withMethod('GET')
        .withRoute("activities")
        .addQuery({include: "activities.user,activities.resource,activities.target,activities.comments"});
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
