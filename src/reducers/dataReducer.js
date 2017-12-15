import { API_DATA_SUCCESS } from '../utils/Api';
import Immutable from 'seamless-immutable';
import merge from 'deepmerge'
import {Statistics} from "../utils/Statistics";
import update from "immutability-helper";
import {updateDelete} from "../utils/DataUtils";

const initialState = Immutable({
    meta: {},
});

export const CREATE_PENDING_ACTION = "CREATE_PENDING_ACTION";
export const REMOVE_PENDING_ACTION = "REMOVE_PENDING_ACTION";
export const CONFIG_SET = 'CONFIG_SET';

const initConfig = {
    devMenu: false,
    disableOfflineMode: false,
};

export  function config(state = initConfig, action) {
    switch (action.type) {
        case CONFIG_SET:
            return {...state, [action.option]: action.value};
        default:
            return state;
    }
}


export function data(state = initialState, action) {
    switch (action.type) {
        case API_DATA_SUCCESS:

            //1. data.hash ?
            //2. background thread ?
            let now = Date.now();
            let result = merge(state, action.data);
            Statistics.recordTime(`mergeData.${action.origin}`, Date.now() - now);
            return result;
        default:
            return state;
    }
}

/*
pending: {
    create_list: [{name: "test"}]],
    status: pending/processing/done
}
*/
export function pending(state = {}, action) {
    switch (action.type) {
        case REMOVE_PENDING_ACTION :{
            let {pendingActionType, id} = action;
            state = updateDelete(state, `${pendingActionType}`, it => it.id === id);
            break;
        }
        case CREATE_PENDING_ACTION: {
            let {payload, pendingActionType, delayMs = 0} = action;
            let now = Date.now();
            let item = {
                id: `pendingAction-${Math.random()}`,
                insertedAt: now,
                dueAt: now + delayMs,
                state: 'pending',
                payload,
                pendingActionType: pendingActionType.name()
            };
            if (!state[pendingActionType]) {
                state = update(state, {[pendingActionType]: {$set: [item]}});
            }
            else {
                state = update(state, {[pendingActionType]: {$push: [item]}});
            }
            break;
        }
    }
    return state;
}


