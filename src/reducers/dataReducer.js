import {API_DATA_SUCCESS} from '../managers/Api'
import Immutable from 'seamless-immutable'
import {Statistics} from "../managers/Statistics"
import update from "immutability-helper"
import {updateSplice0} from "../helpers/DataUtils"
import type {ApiActionName} from "../helpers/ApiAction"
import merge from "../helpers/DeepMerge"

const initialState = Immutable({
    meta: {},
});

export const CREATE_PENDING_ACTION = "CREATE_PENDING_ACTION";
export const REMOVE_PENDING_ACTION = "REMOVE_PENDING_ACTION";
export const CONFIG_SET = 'CONFIG_SET';

const initConfig = {
    devMenu: false,
    disableOfflineMode: false,
    forceOnBoardingCycle: false,
    onlyEmptyFeeds: false,
    onBoardingOnEveryLogin: false //doesnt work. TODO: persistent config accross logouts
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
            if (result !== state) {
                console.debug('data:success:: update')
            }
            return result;
        default:
            return state;
    }
}

type PendingItemState = 'pending' | 'tg';

export type PendingItem = {
    id: Id,
    insertedAt: ms,
    dueAt: ms,
    state: PendingItemState,
    payload: any, //TODO type
    pendingActionType: ApiActionName,
    scope: *, //describe who might be interested in rendering updates. eg: {activityId: "123456789"}
    options: any
}


// [pending reducers]
export function pending(state = {}, action) {
    switch (action.type) {
        case REMOVE_PENDING_ACTION :{
            let {pendingActionType, id} = action;
            state = updateSplice0(state, `${pendingActionType}`, {deletePredicate: it => it.id === id});
            break;
        }
        case CREATE_PENDING_ACTION: {
            const {
                pendingId,
                payload,
                pendingActionType,
                options = {},
            } = action;


            const now = Date.now();

            const item : PendingItem = {
                id: pendingId,
                insertedAt: now,
                dueAt: now + (options.delayMs || __DEBUG_PENDING_DELAY__ || 0),
                state: 'pending',
                payload,
                pendingActionType: pendingActionType.name(),
                options
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


