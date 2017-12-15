import { API_DATA_SUCCESS } from '../utils/Api';
import Immutable from 'seamless-immutable';
import merge from 'deepmerge'
import {Statistics} from "../utils/Statistics";

const initialState = Immutable({
    meta: {},
});

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


