// @flow
import { CALL_API } from 'redux-api-middleware'
import normalize from 'json-api-normalizer';
import * as Api from '../utils/Api'

export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';

export const API_SYMBOL = Symbol("api");


//1. edit store.request : .isLoading, .isLastSuccess, .isLastFailure, .isLastFinished
//2. edit store.data : request has flag -> dataReducer; or other actions
export default store => next => action => {
    const callAPI = action[API_SYMBOL];

    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    const { call, apiAction} = callAPI;

    const actionWith = (data) => {
        const finalAction = Object.assign({}, action, data, {apiAction});
        delete finalAction[API_SYMBOL];
        return finalAction;
    };

    //1.
    next(actionWith({ type: API_DATA_REQUEST}));


    return call.exec()
        .then(
            response => {
                let data = normalize(response);

                //2.
                next(actionWith({ data, type: API_DATA_SUCCESS }));

                return next({type: apiAction.success(), payload: response});
            },
            error => next(actionWith({ type: API_DATA_FAILURE, error: error.message || 'Something bad happened' })),
        );
};

