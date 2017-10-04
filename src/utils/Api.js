// @flow

import URL from "url-parse"
import qs from "querystringify"
import * as Util from "./ModelUtils";
import normalize from 'json-api-normalizer';
import {logout} from "../auth/actions";


export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';

export const API_SYMBOL = Symbol("api");


let currentUserId, client, uid, accessToken;

export const API_END_POINT = "https://goodshitapp-staging.herokuapp.com/";

export function headers() {
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

export function submit(url, method, body) {
    let options = Object.assign({
        method: method,
        headers: headers()
    }, body ? {body: JSON.stringify(body)} : null);

    console.debug(`sending request url=${url}, options: ${JSON.stringify(options)}`);
    return fetch(url, options);
}

export class Call {

    url: URL = new URL(API_END_POINT);
    body: any;
    method: string;

    withRoute(pathname:string) {
        this.url = this.url.set('pathname', pathname);
        return this;
    }

    withBody(body:any) {
        this.body = body;
        return this;
    }

    withQuery(query: any) {
        let q = qs.parse(this.url.query);
        let newVar = Object.assign({}, q || {}, query);
        this.url.set('query', newVar);
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

    disptachForAction(apiAction: ApiAction, options?: any) {
        return {
            [API_SYMBOL]: Object.assign({},
                {
                    call: this,
                    apiAction
                }, options)
        };
    }


    exec() {
        //if (!this.method) throw new Error("call need a method");
        return submit(this.url.toString(), this.method, this.body);
    }
}

export function init(store) {
    store.subscribe(() => {
        console.info(`api initialized with: access-token=${accessToken}, client=${client}, uid=${uid}`);
        let state = store.getState();
        let auth = state.auth;
        accessToken = auth.accessToken;
        client = auth.client;
        uid = auth.uid;
        currentUserId = auth.currentUserId;
    });
}


//TODO: this is shit
export function credentials(a, c, u) {
    console.info(`credentials found: access-token=${a}, client=${c}, uid=${u}`);
    accessToken = a;
    client = c;
    uid = u;
}


export function composeName(actionName: string, apiType: string): string {
    return `${actionName}_${apiType}`;
}

export class ApiAction {

    actionName: string;

    constructor(actionName: string) {
        this.actionName = actionName;

    }

    success() {
        return this.forType("success");
    }

    request() {
        return this.forType("request");
    }

    failure() {
        return this.forType("failure");
    }

    forType(apiType: string) {
        return composeName(this.actionName, apiType);
    }

    forId(id: string) {
        return `${this.name()}[${id}]`;
    }

    name() {
        return this.actionName;
    }
}

export function initialListState() {
    return {
        list: [],
        links: {},
        hasMore: false
    };
}

export const reduceList = function (state, action, desc) {
    switch (action.type) {
        case desc.fetchFirst.success():
        case desc.fetchMore.success():

            let currentList = state.list.asMutable();
            let links = {};

            let payload = action.payload;

            if (currentList.length === 0 || action.type === desc.fetchMore.success()) {
                links.next = payload.links ? payload.links.next : null;
            }

            let newList = payload.data.map((f) => {
                let {id, type} = f;
                return {id, type};
            });

            new Util.Merge(currentList, newList)
                .withHasLess(true)
                .merge();


            state = state.merge({
                list: currentList,
                links,
                hasMore: newList.length > 0 && links && links.next
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
                    next(errorAction);
                    return next(logout())
                }
                return next(errorAction);

            },
        );
};

export {middleware}