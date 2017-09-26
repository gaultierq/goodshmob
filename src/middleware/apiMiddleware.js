// @flow
import { CALL_API } from 'redux-api-middleware'
import normalize from 'json-api-normalizer';

export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';

export const API_SYMBOL = Symbol("api");


let handleRequest = function (callAPI, store, action, next) {

    const actionWith = (data) => {
        return Object.assign({}, action, data);
    };

    next(actionWith({
            type: API_DATA_REQUEST,
            baseType: callAPI.baseType
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
        delete finalAction[API_SYMBOL];
        return finalAction;
    };

    let response = normalize(action.payload, {endpoint: endpoint});

    next(actionWith({
            response,
            type: API_DATA_SUCCESS,
            baseType: callAPI.baseType,
            endpoint
        })
    );

    return next(action);
};
export default store => next => action => {
    const callAPI = action[API_SYMBOL];

    if (typeof callAPI === 'undefined') {
        return next(action);
    }
    if (callAPI.isRequest) {
        return handleRequest(callAPI, store, action, next);
    }
    else {
        return handleNotRequest(callAPI, store, action, next);
    }
};