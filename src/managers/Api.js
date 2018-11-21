// @flow

import URL from "url-parse"
import * as Util from "../helpers/ModelUtils"
import normalize from 'json-api-normalizer'
//hack for tests. FIXME: remove circular dep
import {logoutOffline} from "../auth/actions"
import ApiAction from "../helpers/ApiAction"
import fetch from 'react-native-fetch-polyfill'
import type {Dispatchee, Id, ms, RequestState} from "../types"
import Config from 'react-native-config'
import {Statistics} from "./Statistics"
import {REMOVE_PENDING_ACTION} from "../reducers/dataReducer"
import {NetInfo} from "react-native"
import {sendMessage} from "./Messenger"
import {CONNECTIVITY_CHANGE} from "../reducers/app"
import {sleeper} from "../helpers/TimeUtils"

import analytics from './Analytics'

export const API_DATA_REQUEST = 'API_DATA_REQUEST';
export const API_DATA_SUCCESS = 'API_DATA_SUCCESS';
export const API_DATA_FAILURE = 'API_DATA_FAILURE';
export const TRUNCATE_DATA = 'TRUNCATE_DATA';


const CURRENT_API_VERSION = 'v2.0.0';
export const API_END_POINT = Config.SERVER_URL;


export const TRIGGER_USER_DIRECT_ACTION = 0;
export const TRIGGER_USER_INDIRECT_ACTION = 3;
export const TRIGGER_SYSTEM = 5;

type CallFactory = (payload: any) => Call;

class Api {

    // isConnected: boolean;
    initialized: boolean;
    callFactory: Map<ApiAction, CallFactory> = new Map();
    store: *;

    init(store) {
        this.store = store;
        this.store.subscribe(this.onStoreUpdate.bind(this));

        this.listenConnectivity();


        this.initialized = true;
    }

    listenConnectivity() {
        this.fetchIsConnected()
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnection)
    }

    fetchIsConnected() {
        NetInfo.isConnected.fetch().then(this.handleConnection)
    }

    handleConnection = connected => {
        console.log('Api: ' + (connected ? 'online' : 'offline'));
        // this.isConnected = connected;
        this.store.dispatch({type: CONNECTIVITY_CHANGE, connected});

        this.execPendings();
    }

    _debounceFetchIsConnected = _.debounce(this.fetchIsConnected, 500);

    pendingAction;

    onStoreUpdate() {
        this.execPendings();
    }

    //TODO: this is a hack. logout should preserve 'app' store sub-state
    isConnected() {
        // return true;
        const connected = this.store.getState().app.connected !== false
        if (!connected) {
            this._debounceFetchIsConnected()
        }
        return connected
    }

    execPendings() {

        if (!this.isConnected()) {
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
                this.store.dispatch(call.createActionDispatchee(ApiAction.create(name), options))
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



    submit(call) {
        let {url, method, body, delay, force} = call


        if (!this.initialized) throw "Api must be initialized before being used";

        let auth = instance.auth();

        return new Promise((resolve, reject) => {

            if (Config.SKIP_API_CONNEXION_CHECK !== 'true' && !this.isConnected() && !force) {
                reject(new Error("not connected"));
            }
            else {
                let options = Object.assign({
                    method,
                    timeout: __HTTP_TIMEOUT__,
                    headers: this.headers()
                }, body ? {body: JSON.stringify(body)} : null);

                console.debug(`%c sending request url=${url}, options: ${JSON.stringify(options)}`, 'background: #FCFCFC; color: #E36995');
                fetch(url.toString(), options)
                    .catch(err=> {
                        reject(err);
                    })
                    .then(resp=> {
                        console.log(resp)
                        setTimeout(()=> {
                            if (instance.auth() === auth) {
                                resolve(resp);
                            }
                            else {
                                reject(new Error("User auth has changed. This response should not be saved or processed."));
                            }
                        }, _.isNumber(delay) ? delay : 0);
                    })
            }

        });


    }
}

//move
export class Call {

    url: URL = new URL(API_END_POINT);
    body: any;
    method: string;
    delay: ms;
    force: boolean

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
        if (query) {
            let newQuery = Object.assign({}, this.url.query || {}, query);
            this.url.set('query', newQuery);
        }
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

    //ignore "isConnected"
    force() {
        this.force = true
        return this
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
    // error management:
    // - no connectivity => sticky snack, do not display anything on screen
    // - load more timeout => display some in-screen message on screen (with retry)
    // - default: temp. snack (ouch! ...)
    // - item already in lineup: some alerts
    createActionDispatchee(apiAction: ApiAction, options?: {
        trigger?: any,
        mergeOptions?: {drop?: boolean},
    }): Dispatchee {
        const call = this
        const {trigger = TRIGGER_USER_DIRECT_ACTION} = options || {}

        return (dispatch) => {
            let tic = Date.now();
            //let {meta} = options;
            return new Promise((resolve, reject) => {
                call.run()
                    .then(resp => {
                            const debugError = this.debugFail(apiAction);
                            if (debugError) throw debugError;
                            return resp;
                        },
                        err => {
                            // console.warn("test::1")
                            throw err
                        }
                    )
                    .then(
                        resp => {
                            let requestTime = Date.now() - tic;
                            Statistics.recordTime(`request.${apiAction.name()}`, requestTime);
                            // we are calling logCustom here so we can record the action
                            // description into the fabric events dashboard
                            const { original: { status } } = resp
                            analytics.logCustom(apiAction.description(), {
                                requestTime,
                                status,
                            });
                            return resp;
                        },
                        //useless
                        err => {
                            // console.warn("test::2")
                            throw err
                        }
                    )
                    .then(sleeper(Math.max(__MIN_REQUEST_TIME__ - (Date.now() - tic), 0)))
                    // .then(sleeper(5000))

                    .then(resp => {
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
                            })
                            return response
                        }
                    )
                    .then(response => {
                            // console.warn("test::6")
                            resolve(response);
                        },
                        //1., 2.
                        error => {
                            // console.warn("test::3")
                            if (trigger <= 2) {
                                sendMessage(
                                    __IS_LOCAL__ ?
                                        `#request failure: '${(error.message || `${error.status}! [${apiAction}]: ${JSON.stringify(error)}`)}'` :
                                        i18n.t('common.api.generic_error')
                                );
                            }


                            if (error.status === 401) {
                                // dispatch(errorAction);
                                //logout(dispatch);
                                logoutOffline(dispatch);
                                reject("user lost authentification: " + apiAction.name());
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
        if (__API_PAGINATION_PER_PAGE__) {
            this.addQuery({per_page: __API_PAGINATION_PER_PAGE__})
        }

        return instance.submit(this)
            .catch(err => {throw err})
            .then(resp => {
                if (resp.ok) {
                    let contentType = resp.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return resp.json().then((json) => ({json, original: resp}));
                    }
                    return {json: "ok", original: resp};
                }
                throw resp
            });
    }

    submit() {
        return instance.submit(this)
    }

    // exec() {
    //     //if (!this.method) throw new Error("call need a method");
    //     return instance.submit(this.url.toString(), this.method, this.body);
    // }

    debugFail(action: ApiAction) {
        let conf = this.obtainDebugFailConfig();
        return conf && conf.getFail(action);
    }

    debugFailObtained: boolean = false
    debugfailConfig: ?DebugFailConfig

    obtainDebugFailConfig(): ?DebugFailConfig {
        if (!this.debugFailObtained) {
            this.debugFailObtained = true;
            if (Config.DEBUG_FAIL_CONFIG) {
                try {
                    let conf = JSON.parse(Config.DEBUG_FAIL_CONFIG);
                    this.debugfailConfig = new DebugFailConfig(conf);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        return this.debugfailConfig;
    }
}
const instance : Api = new Api();

/*
    rate: 0.1,
    err: {httpCode: 500, message: "Generic error message"},
    actions:
        {
            save_item:
                {
                    rate: 0.5,
                    err: {httpCode: 422, message: "You cannot save an item in this list"}
                }
        }
 */
class DebugFailConfig {

    globalConf: any; //TYPEME
    confByAction = {};

    constructor(jsonObj) {
        this.globalConf = this.makeErr(jsonObj);
        _.forIn(jsonObj.actions, (value, key) => {
            this.confByAction[key] = this.makeErr(value)
        });

    }

    makeErr(obj) {
        let rate = _.get(obj, 'rate', 0);
        let err = _.get(obj, 'err', {httpCode: 511, message: 'Fake error message'});
        return {rate, err};
    }

    getFail(action: ApiAction) {
        let errConf = this.confByAction[action.name()] || this.globalConf;
        return errConf && Math.random() < errConf.rate && this.thrown(errConf);

    }

    thrown(errConf) {
        return new FakeError(errConf.err.message, errConf.err.httpCode);
    }
}

//https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel
class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

// now I can extend
class FakeError extends ExtendableError {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}


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
            const pStat = _.set({}, stateName, reqFetch)
            this.setState(pStat, resolve);
        });

    };
    // $FlowFixMe
    if (_.get(this.state, stateName) !== 'sending') {

        // $FlowFixMe
        return setRequestState('sending')()
            .then(block)
            .then(
                setRequestState('ok'),
                err => {
                    setRequestState('ko')().then(()=> {
                        console.warn(err);
                    });
                    throw err;
                }
            );
    }
    else {
        console.debug('exec block skipped');
        return new Promise();
    }
}

//move
export const reduceList = (state, action, desc, optionalExtractor?) => {
    switch (action.type) {
        case desc.fetchFirst.success():

            let currentList = state.list.asMutable();
            let links = {};

            let payload = action.payload;

            let hasNoMore = payload.data.length === 0;

            let newList = payload.data.map(f => {
                let {id, type} = f;
                let options = {};
                if (optionalExtractor) {
                    options = optionalExtractor(f);
                }
                return {id, type, ...options};
            });

            currentList = new Util.Merge(currentList, newList)
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


export const reduceList2 = (state: STATE<SHELL>, action: REDUX_ACTION<SHELL>, apiAction: ApiAction, optionalExtractor?: any => any) => {
    switch (action.type) {
        case apiAction.success():

            let {mergeOptions = {}} = action.options
            if (mergeOptions.drop) {
                console.debug("droping data");
                state = {...state, list: []}
            }

            let newList = action.payload.data.map(f => {
                let {id, type} = f;
                let options = optionalExtractor && optionalExtractor(f) || {};
                return {id, type, ...options};
            });

            let merged;
            try {
                merged = new Util.Merge(state.list || [], newList)
                    .withOptions(mergeOptions)
                    .merge();
            }
            catch (e) {
                console.error(e)
                throw e
            }

            if (merged !== state.list) state = {...state, list: merged}

            const hasNoMore = action.payload.data.length === 0;
            if (hasNoMore !== state.hasNoMore) state = {...state, hasNoMore: hasNoMore}

    }
    return state;
};



export type STATE<T> = {
    list?: Array<T>,
    hasNoMore?: boolean
}

export type SHELL = {
    id: Id, type: string
}

export type REDUX_ACTION<T> = {
    type: string,
    payload: {data: Array<T>},
    options: any
}

