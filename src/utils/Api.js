// @flow

import URL from "url-parse"
import qs from "querystringify"

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

