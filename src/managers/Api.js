// @flow

import URL from "url-parse"
import * as Util from "../helpers/ModelUtils";
import normalize from 'json-api-normalizer';
//hack for tests. FIXME: remove circular dep
import {logoutOffline} from "../auth/actions";
import ApiAction from "../helpers/ApiAction";
import fetch from 'react-native-fetch-polyfill';
import type {ms, RequestState} from "../types";
import Config from 'react-native-config'
import {Statistics} from "./Statistics";
import {REMOVE_PENDING_ACTION} from "../reducers/dataReducer";
import {NetInfo} from "react-native";
import {sendMessage} from "./Messenger";

export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';


const CURRENT_API_VERSION = 'v2.0.0';
export const API_END_POINT = Config.SERVER_URL;


export const TRIGGER_USER_DIRECT_ACTION = 0;
export const TRIGGER_USER_INDIRECT_ACTION = 3;
export const TRIGGER_SYSTEM = 5;

type CallFactory = (payload: any) => Call;

class Api {

    isConnected: boolean;
    initialized: boolean;
    callFactory: Map<ApiAction, CallFactory> = new Map();


    init(store) {
        this.store = store;
        this.store.subscribe(this.onStoreUpdate.bind(this));

        this.listenConnectivity();


        this.initialized = true;
    }

    listenConnectivity() {
        let handleConnection = isConnected => {
            console.log('Api: ' + (isConnected ? 'online' : 'offline'));
            this.isConnected = isConnected;
            this.execPendings();
        };

        NetInfo.isConnected.fetch().then(handleConnection);
        NetInfo.isConnected.addEventListener('connectionChange', handleConnection);
    }

    onStoreUpdate() {
        this.execPendings();
    }

    pendingAction;

    execPendings() {

        if (!this.isConnected) {
            console.debug('Api: exec pendings: no connection');
            return;
        }

        let pending = this.store.getState().pending;
        if (!pending) return;
        if (this.pendingAction) {
            console.debug('already executing pending action');
            return;
        }
        let pendings = _.flatten(_.values(pending));
        pendings = _.filter(pendings, p=>p.state === 'pending');
        pendings = _.sortBy(pendings, [(p) => p['dueAt']]);

        let pend = _.head(pendings);

        if (pend) {
            console.debug('Api: exec pendings');
            let delay = pend.dueAt - Date.now();
            if (delay > 0) {
                console.info(`execPendings: pending action found but not dued yet (schedueuled in ${delay} ms)`);
                setTimeout(()=>this.execPendings(), delay);
                return;
            }
            this.pendingAction = pend;
            let call;
            console.info(`execPendings: found pending action:${JSON.stringify(this.pendingAction)}`);

            let name = this.pendingAction.pendingActionType;

            let action = ApiAction.getByName(name);
            if (action) {
                let factory = this.callFactory.get(action);
                if (factory) {
                    call = factory(this.pendingAction.payload);
                }
                else {
                    console.warn(`factory not found for ${action}`);
                }
            }
            else {
                console.warn(`action not found for ${name}`);
            }

            // switch (name) {
            //     //TODO: remove this dependency
            //     case CREATE_LINEUP.name():
            //         call = new Call()
            //             .withMethod('POST')
            //             .withRoute("lists")
            //             .withBody({
            //                 "list": {
            //                     "name": this.pendingAction.payload.listName
            //                 }
            //             });
            //         break;
            // }

            let finish = () => {
                let id = this.pendingAction.id;
                this.pendingAction = null;

                //will trigger store update
                this.store.dispatch({
                    type: REMOVE_PENDING_ACTION,
                    pendingActionType: name,
                    id: id
                });
            };

            if (call && name) {
                let options =  this.pendingAction.options;
                this.store.dispatch(call.disptachForAction2(ApiAction.create(name), options))
                    .then(() => finish(), err => {
                        console.warn(err);
                        finish();
                    });
            }
            else {
                console.warn("impossible to process pending action");
                finish();
            }
        }
        else {
            //console.debug("api: no pending action found");
        }
    }

    auth() {
        return this.store.getState().auth;
    }

    headers() {
        if (!this.store) return null; //tests
        let state = this.store.getState();

        let {accessToken, client, uid} = state.auth;
        let {currentDeviceId} = state.device;

        return _.pickBy({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Api-Version': Config.API_VERSION,
            "Client": client,
            "Uid": uid,
            "Access-Token": accessToken,
            "Device-ID": currentDeviceId
        }, _.identity);
    }



    submit(url, method, body, delay) {
        if (!this.initialized) throw "Api must be initialized before being used";

        let timeout = __HTTP_TIMEOUT__;
        let options = Object.assign({
            method,
            timeout,
            headers: this.headers()
        }, body ? {body: JSON.stringify(body)} : null);

        console.debug(`%c sending request url=${url}, options: ${JSON.stringify(options)}`, 'background: #FCFCFC; color: #E36995');
        let auth = instance.auth();

        return new Promise((resolve, reject) => {

            fetch(url, options)
                .catch(err=> {
                    reject(err);
                })
                .then(resp=> {
                    setTimeout(()=> {
                        if (instance.auth() === auth) {
                            resolve(resp);
                        }
                        else {
                            reject(new Error("User auth has changed. This response should not be saved or processed."));
                        }
                    }, _.isNumber(delay) ? delay : 0);
                })
        });


    }
}

//move
export class Call {

    url: URL = new URL(API_END_POINT);
    body: any;
    method: string;
    delay: ms;

    //headers = instance.headers();

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

    delay(delay:ms): Call {
        this.delay = delay;
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

    //options.trigger = 0,1,2,3,4... 0 is an user action, 10 is from system
    disptachForAction2(apiAction: ApiAction, options?: any = {}) {
        const call = this;
        const {trigger = TRIGGER_USER_DIRECT_ACTION} = options;

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
                            dispatch({
                                type: apiAction.success(),
                                payload: response,
                                original: resp.original,
                                options
                            });

                            resolve(response);
                        },
                        //1., 2.
                        error => {
                            let errMsg = error.message || `${error.status}! [${apiAction}]: ${JSON.stringify(error)}`;

                            // let errorAction = dispatch({ type: API_DATA_FAILURE, error: errMsg, origin: apiAction});

                            if (trigger <= 2) {
                                sendMessage(
                                    __IS_LOCAL__ ?
                                        `#request failure: '${errMsg}'` :
                                        i18n.t('common.api.generic_error')
                                );
                            }


                            if (error.status === 401) {
                                // dispatch(errorAction);
                                //logout(dispatch);
                                logoutOffline(dispatch);
                                reject("user lost authentification");
                                return;
                            }
                            // dispatch(errorAction);
                            reject(error);
                        },
                    );
            });
        }
    }

    run() {
        if (!this.method) throw new Error(`call need a method ${this.toString()}`);
        return instance.submit(this.url.toString(), this.method, this.body, this.delay)
            .catch(err => {throw err})
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

    // exec() {
    //     //if (!this.method) throw new Error("call need a method");
    //     return instance.submit(this.url.toString(), this.method, this.body);
    // }
}
const instance : Api = new Api();


export function init(store) {
    instance.init(store);
    console.info("Api initialized");
}

//enable the api to create call by itself
export function registerCallFactory(action: ApiAction, factory: CallFactory) {
    instance.callFactory.set(action, factory);
}

//move
export function initialListState() {
    return {
        list: [],
        links: {},
        hasMore: false
    };
}

//move
export function safeDispatchAction(dispatch, action, stateName: string) {
    return safeExecBlock.call(this, function(){return dispatch(action)}, stateName);
}

//move
export function safeExecBlock(block, stateName: string) {

    let setRequestState: (reqFetch: RequestState) => () => Promise<*> = (reqFetch: RequestState) => {
        return () => new Promise((resolve, reject) => {
            this.setState({[stateName]: reqFetch}, resolve);
        });

    };
    // $FlowFixMe
    if (this.state[stateName] !== 'sending') {

        // $FlowFixMe
        return setRequestState('sending')()
            .then(block)
            .then(
                setRequestState('ok'),
                err => {
                    setRequestState('ko')().then(()=> {
                        console.error(err);
                    });
                    throw err;
                }
            );
    }
    else {
        console.debug('exec block skipped');
        return null;
    }
}

//move
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