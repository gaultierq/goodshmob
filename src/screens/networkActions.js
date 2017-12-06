// @flow

import ApiAction from "../utils/ApiAction";
import * as Api from "../utils/Api";
import Immutable from 'seamless-immutable';
import type {Id} from "../types";

export const FETCH_ACTIVITIES = new ApiAction("network/fetch_activities");

export function fetchMyNetwork() {
    return new Api.Call()
        .withMethod('GET')
        .withRoute("activities")
        .addQuery({include: "user,resource,target"});
}

export function fetchUserNetwork(userId: Id) {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`users/${userId}/activities`)
        .addQuery({include: "user,resource,target"});
}

export const reducer = (() => {
    const initialState = Immutable({});

    const initialSubState = Immutable(Api.initialListState());

    return (state = initialState, action) => {

        if (action.type === FETCH_ACTIVITIES.success()) {
            let {userId} = action.options || {};

            if (userId) {
                let subState = state[userId] || initialSubState;
                subState = Api.reduceList(subState, action, {fetchFirst: FETCH_ACTIVITIES});
                state = state.merge({[userId]: subState}, {deep: true});
            }
        }

        return state;
    }
})();