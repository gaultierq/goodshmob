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
    let toMerge = Api.handleAction(action, state, () => action.meta.id, types.FETCH, types.LIKE, types.UNLIKE);
    if (toMerge) {
        state = state.merge(toMerge, {deep: true})
    }

    switch (action.type) {
        case types.APPEND_FETCHED_ACTIVITIES:
            let res = action.activities.reduce((map, obj) => {
                map[obj.id] = obj;
                return map;
            }, {});
            state = state.merge({all: res}, {deep: true});
            break;
        case Api.composeName(types.FETCH, Api.SUCCESS):
            let activity = Util.parse(action.payload);
            state = updateActivitiesStore(activity, state);
            break;
        case Api.composeName(types.LIKE, Api.SUCCESS):
        {
            let like = Util.parse(action.payload);
            let activity = like.resource;
            state = updateActivitiesStore(activity, state);
            //state = Immutable.setIn(state, ["all", action.meta.activityId, "meta", "liked"], true);
            break;
        }
        case Api.composeName(types.UNLIKE, Api.SUCCESS):{

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
