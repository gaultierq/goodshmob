// @flow

import URL from "url-parse"
import qs from "querystringify"
import * as Util from "./ModelUtils";
import normalize from 'json-api-normalizer';
//hack for tests. FIXME: remove circular dep
import {logout} from "../auth/actions";
import ApiAction from "./ApiAction";


export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';

export const API_SYMBOL = Symbol("api");


export const API_END_POINT = "https://goodshitapp-staging.herokuapp.com/";


let instance : Api = null;

class Api {

    constructor(store) {
        this.store = store;
    }

    headers() {
        if (!this.store) return null; //tests
        let state = this.store.getState();
        let auth = state.auth;

        let {accessToken, client, uid} = auth;

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        //TODO: find nicer syntax
        if (client) headers['Client'] = client;
        if (uid) headers['Uid'] = uid;
        if (accessToken) headers['Access-Token'] = accessToken;
        return headers;
    }


    submit(url, method, body) {
        let options = Object.assign({
            method: method,
            headers: this.headers()
        }, body ? {body: JSON.stringify(body)} : null);

        console.debug(`sending request url=${url}, options: ${JSON.stringify(options)}`);
        return fetch(url, options);
    }

}


export class Call {

    url: URL = new URL(API_END_POINT);
    body: any;
    method: string;
    headers = instance.headers();

    withRoute(pathname:string) {
        this.url = this.url.set('pathname', pathname);
        return this;
    }

    withBody(body:any) {
        this.body = body;
        return this;
    }

    addQuery(query: any) {
        let currentQuery = this.url.query;
        let q = currentQuery;//qs.parse(currentQuery);
        let newQuery = Object.assign({}, q || {}, query);
        this.url.set('query', newQuery);
        return this;
    }

    withMethod(method:string): Call {
        this.method = method;
        return this;
    }

    static parse(url): Call {
        let result = new Call();
        result.url = new URL(url);
        return result;
    }

    toString() {
        return "call:" + url.toString();
    }

    buildUrl() {
        return this.url.toString();
    }

    disptachForAction(apiAction: ApiAction, options?: any) {

        //fetch
        // on result -> dispatch other action

        return {
            [API_SYMBOL]: Object.assign({},
                {
                    call: this,
                    apiAction
                }, options)
        };
    }

    disptachForAction2(apiAction: ApiAction, options?: any) {
        const call = this;
        return (dispatch) => {
            let meta = options ? options.meta : null;

            return call
                .exec()
                .then(resp => {
                    console.debug("api: response");
                    if (resp.ok) {
                        let contentType = resp.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            return resp.json().then((json)=> ({json, original: resp}));
                        }
                        return {json: "ok", original: resp};
                    }
                    let status = resp.status;

                    return resp.json().then(err => {
                        throw {...err, status: status}
                    });
                })
                .then(resp => {
                        let response = resp.json;
                        let data = normalize(response);

                        //1., 2.
                        dispatch({ data, type: API_DATA_SUCCESS });

                        return dispatch(Object.assign({}, {type: apiAction.success(), payload: response, original: resp.original}, {meta}));
                    },
                    //1., 2.
                    error => {
                        let errMsg = error.message || `Something bad happened (${error.status}): ${JSON.stringify(error)}`;

                        let errorAction = dispatch({ type: API_DATA_FAILURE, error: errMsg });
                        if (error.status === 401) {
                            dispatch(errorAction);
                            return dispatch(logout())
                        }
                        return dispatch(errorAction);

                    },
                );
        };



    }


    exec() {
        //if (!this.method) throw new Error("call need a method");
        return instance.submit(this.url.toString(), this.method, this.body);
    }
}

export function init(store) {
    instance = new Api(store);
}

export function initialListState() {
    return {
        list: [],
        links: {},
        hasMore: false
    };
}

export const reduceList = (state, action, desc) => {
    switch (action.type) {
        case desc.fetchFirst.success():

            let currentList = state.list.asMutable();
            let links = {};

            let payload = action.payload;

            let hasNoMore = payload.data.length === 0;

            let newList = payload.data.map((f) => {
                let {id, type} = f;
                return {id, type};
            });

            new Util.Merge(currentList, newList)
                .withHasLess(true)
                .merge();


            state = state.merge({
                list: currentList,
                //links,
                hasMore: newList.length > 0 && links && !!links.next,
                hasNoMore
            }, {deep: true});

    }
    return state;
};


//1. edit store.request : .isLoading, .isLastSuccess, .isLastFailure, .isLastFinished
//2. edit store.data : request has flag -> dataReducer; or other actions
let middleware = store => next => action => {
    const callAPI = action[API_SYMBOL];

    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    const { call, apiAction, meta} = callAPI;

    const actionWith = (data) => {
        const finalAction = Object.assign({}, callAPI, data, {apiAction});
        delete finalAction[API_SYMBOL];
        return finalAction;
    };

    //1.
    next(actionWith({ type: API_DATA_REQUEST}));


    return call
        .exec()
        .then(resp => {
            console.debug("api: response")
            if (resp.ok) {
                let contentType = resp.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return resp.json().then((json)=> ({json, original: resp}));
                }
                return {json: "ok", original: resp};
            }
            let status = resp.status;

            return resp.json().then(err => {
                throw {...err, status: status}
            });
        })
        .then(resp => {
                let response = resp.json;
                let data = normalize(response);

                //1., 2.
                next(actionWith({ data, type: API_DATA_SUCCESS }));

                return next(Object.assign({}, {type: apiAction.success(), payload: response, original: resp.original}, {meta}));
            },
            //1., 2.
            error => {
                let errMsg = error.message || `Something bad happened (${error.status}): ${JSON.stringify(error)}`;

                let errorAction = actionWith({ type: API_DATA_FAILURE, error: errMsg });
                if (error.status === 401) {
                    console.log("unauthorized user. loging out")
                    next(errorAction);
                    return next(logout())
                }
                return next(errorAction);

            },
        );
};

export {middleware}