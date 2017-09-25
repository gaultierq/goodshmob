// @flow
import { CALL_API } from 'redux-api-middleware'
import normalize from 'json-api-normalizer';
import en from "../i18n/locales/en";

export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';

export const API_SYMBOL = Symbol("api");
export const API_REQUEST_SYMBOL = Symbol("api pre");


let handleRequest = function (callAPI, store, action, next) {

    const actionWith = (data) => {
        return Object.assign({}, action, data);
    };

    next(actionWith({
            type: API_DATA_REQUEST,
            baseType: action.type
        }
    ));

    return next(action);
};

let handleNotRequest = function (callAPI, store, action, next) {
    let {endpoint} = callAPI;

    if (typeof endpoint === 'function') {
        endpoint = endpoint(store.getState());
    }
    if (typeof endpoint !== 'string') {
        throw new Error('Specify a string endpoint URL.');
    }

    const actionWith = (data) => {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[CALL_API];
        return finalAction;
    };

    let response = normalize(action.payload, {endpoint: endpoint});

    next(actionWith({
            response,
            type: API_DATA_SUCCESS,
            baseType: action.type,
            endpoint
        }
    ));

    return next(action);
};
export default store => next => action => {
    const callAPI = action[API_SYMBOL];

    if (typeof callAPI === 'undefined') {
        return next(action);
    }
    let isRequest = callAPI.isRequest;
    let isCallApiUndefined = (typeof action[CALL_API] === 'undefined');
    if (!isRequest && !isCallApiUndefined) {
        throw new Error("this action has not been consumed by redux-api-middleware yet");
    }
    else if (isRequest && isCallApiUndefined) {
        throw new Error("this action is expeceted to be consumed by redux-api-middleware");
    }
    if (isRequest) {
        return handleRequest(callAPI, store, action, next);
    }
    else {
        return handleNotRequest(callAPI, store, action, next);
    }
};