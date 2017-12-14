// @flow

import URL from "url-parse"
import * as Util from "./ModelUtils";
import normalize from 'json-api-normalizer';
//hack for tests. FIXME: remove circular dep
import {logout, logoutOffline} from "../auth/actions";
import ApiAction from "./ApiAction";
import fetch from 'react-native-fetch-polyfill';
import Snackbar from "react-native-snackbar"
import type {RequestState} from "../types";

export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';

import Config from 'react-native-config'
import {Statistics} from "./Statistics";



const CURRENT_API_VERSION = 'v2.0.0';
export const API_END_POINT = Config.SERVER_URL;


let instance : Api = null;

class Api {

    constructor(store) {
        this.store = store;
    }

    headers() {
        if (!this.store) return null; //tests
        let state = this.store.getState();

        let {accessToken, client, uid} = state.auth;
        let {currentDeviceId} = state.device;

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Api-Version': CURRENT_API_VERSION
        };

        //TODO: find nicer syntax
        if (client) headers['Client'] = client;
        if (uid) headers['Uid'] = uid;
        if (accessToken) headers['Access-Token'] = accessToken;
        if (currentDeviceId) headers['Device-ID'] = currentDeviceId;
        return headers;
    }


    submit(url, method, body) {
        let timeout = 20 * 1000;
        let options = Object.assign({
            method,
            timeout,
            headers: this.headers()
        }, body ? {body: JSON.stringify(body)} : null);

        console.debug(`%c sending request url=${url}, options: ${JSON.stringify(options)}`, 'background: #FCFCFC; color: #E36995');
        return fetch(url, options);
    }
}


export class Call {

    url: URL = new URL(API_END_POINT);
    body: any;
    method: string;
    headers = instance.headers();

    withRoute(pathname:string): Call {
        this.url = this.url.set('pathname', pathname);
        return this;
    }

    withBody(body:any): Call {
        this.body = body;
        return this;
    }

    addQuery(query: any): Call {
        let currentQuery = this.url.query;
        let q = currentQuery;//qs.parse(currentQuery);
        let newQuery = Object.assign({}, q || {}, query);
        this.url.set('query', newQuery);
        return this;
    }

    include(include: string): Call {
        if (include) {
            this.addQuery({include});
        }
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
        return "call:" + this.url.toString();
    }

    buildUrl() {
        return this.url.toString();
    }

    disptachForAction2(apiAction: ApiAction, options?: any = {}) {
        const call = this;
        return (dispatch) => {
            let tic = Date.now();
            //let {meta} = options;
            return new Promise((resolve, reject) => {
                call.run()
                    .then(resp => {
                            let requestTime = Date.now() - tic;
                            console.debug(`request time ms [${apiAction}] = ${requestTime}` );

                            // let url2 = call.url.toString();
                            /*dispatch({type: STAT_DURATION, path: `request.${url2}`, value: requestTime});*/
                            Statistics.recordTime(`request.${apiAction.name()}`, requestTime);


                            let response = resp.json;

                            let data = normalize(response);

                            //write in data
                            dispatch({ data, type: API_DATA_SUCCESS, origin: apiAction});

                            //let the reducer do something
                            dispatch(Object.assign({}, {type: apiAction.success(), payload: response, original: resp.original}, {options}));

                            resolve(response);
                        },
                        //1., 2.
                        error => {
                            let errMsg = error.message || `${error.status}! [${apiAction}]: ${JSON.stringify(error)}`;

                            let errorAction = dispatch({ type: API_DATA_FAILURE, error: errMsg, origin: apiAction});

                            Snackbar.show({
                                title: "#request failure",
                            });

                            if (error.status === 401) {
                                dispatch(errorAction);
                                //logout(dispatch);
                                logoutOffline(dispatch);
                                reject("user lost authentification");
                                return;
                            }
                            dispatch(errorAction);
                            reject("api error:" + errMsg);

                        },
                    );
            });
        }
    }

    run() {
        return this.exec()
            .then(resp => {
                console.debug("api: response");
                if (resp.ok) {
                    let contentType = resp.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return resp.json().then((json) => ({json, original: resp}));
                    }
                    return {json: "ok", original: resp};
                }
                let status = resp.status;

                return resp.json().then(err => {
                    throw {...err, status: status}
                });
            });
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

export function safeDispatchAction(dispatch, action, stateName: string) {
    return safeExecBlock.call(this, function(){return dispatch(action)}, stateName);
}

export function safeExecBlock(block, stateName: string) {

    let setRequestState: (reqFetch: RequestState) => Promise<*> = (reqFetch: RequestState) => {
        return new Promise((resolve, reject) => {
            this.setState({[stateName]: reqFetch}, resolve);
        });

    };
    // $FlowFixMe
    if (this.state[stateName] !== 'sending') {

        return setRequestState('sending')
            .then(block)
            .then(
                () => setRequestState('ok'),
                err => {
                    setRequestState('ko');
                    console.error(err);
                    throw err;
                }
            );
    }
    else {
        console.debug('exec block skipped');
        return null;
    }
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