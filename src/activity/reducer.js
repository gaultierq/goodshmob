// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import * as Api from "../utils/Api";
import * as Util from "../utils/ModelUtils";

const initialState = Immutable(Object.assign(
    {all: {}, like: {}, unlike: {}},
    createDefault(types.FETCH, types.LIKE, types.UNLIKE)));

let updateActivitiesStore = function (activity, state) {
    let id: string = activity.id;
    let one = {};
    one[id] = activity;
    state = Immutable.merge(state, {all: one}, {deep: true});
    return state;
};
export default function reduce(state:any = initialState, action: any) {

    let toMerge =
        new Api.Handler(action, () => action.meta.id)
            .handleAll(types.FETCH)
            .handleAll(types.LIKE)
            .handleAll(types.UNLIKE)
            .obtain();

    if (toMerge) state = state.merge(toMerge, {deep: true});

    switch (action.type) {
        // case types.LOAD_FEED.success():
        // case types.LOAD_MORE_FEED.success():
        //     let res = action.payload.data.reduce((map, obj) => {
        //         map[obj.id] = obj;
        //         return map;
        //     }, {});
        //     state = state.merge({all: res}, {deep: true});
        //     break;
        case types.FETCH.success():
            let activity = Util.parse(action.payload);
            state = updateActivitiesStore(activity, state);
            break;
        case types.LIKE.success():
        {
            let like = Util.parse(action.payload);
            let activity = like.resource;
            state = updateActivitiesStore(activity, state);
            //state = Immutable.setIn(state, ["all", action.meta.activityId, "meta", "liked"], true);
            break;
        }
        case types.UNLIKE.success():{

            state = Immutable.setIn(state, ["all", action.meta.id, "meta", "liked"], false);
            let count = state.all[action.meta.id].meta["likes-count"];
            state = Immutable.setIn(state, ["all", action.meta.id, "meta", "likes-count"], --count);
            break;
        }
    }
    return state;
}

function createDefault(...actions) {
    let result = {};
    for (let action of actions) {
        result[action] = {
            requesting: false,
            error: null
        };
    }

    return result;
}
