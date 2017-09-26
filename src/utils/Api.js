// @flow

import URL from "url-parse"
import qs from "querystringify"
import * as Util from "./ModelUtils";
import { CALL_API } from 'redux-api-middleware'
import { API_SYMBOL } from '../middleware/apiMiddleware'

export const ALL_API_TYPE = [];

export const REQUEST = add("request");
export const SUCCESS = add("success");
export const FAILURE = add("failure");



let client, uid, accessToken;

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
};

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

    withRoute(pathname:string) {
        this.url = this.url.set('pathname', pathname);
        return this;
    }

    withQuery(query) {

        let q = qs.parse(this.url.query);


        let newVar = Object.assign({}, q || {}, query);
        this.url.set('query', newVar);
        return this;
    }

    static parse(url) {
        let result = new Call();
        result.url = new URL(url);
        return result;
    }

    get() {
        let urlString = this.url.toString();
        return xhr(urlString, 'GET', this.body);
    }

    getUrl() {
        return this.url.toString();
    }
}

let xhr = function (route, verb, body) {

    return submit(route, verb, body)
        .then( resp => {

            let json = resp.json();
            if (resp.ok) return json;
            return json.then(err => {throw err});
        })
        .then(json => {
            let data = json.data;
            let included = json.included;
            console.debug(`receiving response:\n ${JSON.stringify(json, null, '\t')}`);
            return json;
        });
};




export function post(target, body) {
    return xhr(target, 'POST', body);
}

// export function get(target, body) {
//     return xhr(target, 'GET', body);
// }

//TODO: this is shit
export function credentials(a, c, u) {
    console.info(`credentials found: access-token=${a}, client=${c}, uid=${u}`);
    accessToken = a;
    client = c;
    uid = u;

}

export class Handler {
    action: any;
    idPromise: () => string;
    result: any;

    constructor(action, idPromise) {
        this.action = action;
        this.idPromise = idPromise;
    }

    handle(apiAction: ApiAction, ...actionTypes: string[]) {
        if (!this.result) this.result = handleAction(this.action, this.idPromise, apiAction, ...actionTypes);
        return this;
    }

    handleAll(apiAction: ApiAction) {
        return this.handle(apiAction, REQUEST, SUCCESS, FAILURE);
    }

    and(apiAction: ApiAction, ...actionTypes: string[]) {
        return this.handle(apiAction, actionTypes);
    }

    obtain() {
        return this.result;
    }
}


export function handleAction(action: any, idPromise: () => string, actionObject: ApiAction, ...actionTypes: string[]) {
    let actionName = actionObject.name();

    let formatResult =  (toMerge) => {
        return idPromise ? {[actionName]: {[idPromise()]: toMerge}} : {[actionName]: toMerge};
    };

    let type: string = action.type;

    for (let typ of actionTypes) {

        if (actionObject.forType(typ) !== type) continue;

        switch (typ) {
            case REQUEST:
                return formatResult({ requesting: true });
            case SUCCESS:
                let payload = action.payload;
                let data = payload ? Util.parse(payload) : null;
                return formatResult({
                    data: data,
                    requesting: false,
                    error: null
                });
            case FAILURE:
                let error = action.payload;
                console.error(error);
                return formatResult({
                    requesting: false,
                    error: error
                });
        }
    }

    return null;
}


export function composeName(actionName, apiType: string): string {
    return `${actionName}_${apiType}`;
}


function add(item: string): string {
    ALL_API_TYPE.push(item);
    return item;
}

export function createSimpleApiCall(route: string, method: string, apiAction: ApiAction, meta?: any) {
    return {
        [CALL_API]: {
            endpoint: `${API_END_POINT}/` + route,
            method: method,
            headers: headers(),
            types: ALL_API_TYPE.map((type) => {
                return {type: apiAction.forType(type), meta};
            })
        }
    }
}

//TODO: merge me with my sis
export function createSimpleApiCall2(url, type) {
    return {
        [CALL_API]: {
            endpoint: url,
            method: "GET",
            headers: headers(),
            types: [
                type.request(),
                {
                    type: type.success(),
                    payload: (action, state, res) => {

                        return res.json().then((payload) => {
                            return {
                                data: Util.parse(payload),
                                links: payload.links
                            };
                        });

                    },
                },
                type.failure()
            ],
        }
    };
}

export class ApiAction {

    actionName: string;

    constructor(actionName: string) {
        this.actionName = actionName;

    }

    success() {
        return composeName(this.actionName, SUCCESS);
    }

    request() {
        return composeName(this.actionName, REQUEST);
    }

    failure() {
        return this.forType(FAILURE);
    }

    forType(apiType: string) {
        return composeName(this.actionName, apiType);
    }

    name() {
        return this.actionName;
    }
}

export function sendAction(apiAction, call) {
    let types = ALL_API_TYPE.map((apiActionType) => {
        return {
            type: apiAction.forType(apiActionType),
            [API_SYMBOL]: {
                isRequest: apiActionType === REQUEST,
                endpoint: call.getUrl(),
                baseType: apiAction
            }
        }
    });
    return {
        [CALL_API]: {
            endpoint: call.getUrl(),
            method: "GET",
            headers: headers(),
            types: types,
        }
    };
}