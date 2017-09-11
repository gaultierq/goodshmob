
let client, uid, accessToken;

let apiEndpoint = "https://goodshitapp-staging.herokuapp.com/";

let headers = function () {
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
export function submit(route, method, body) {
    let url = apiEndpoint + route;
    let options = Object.assign({
        method: method,
        headers: headers()
    }, body ? {body: JSON.stringify(body)} : null);

    console.debug(`sending request url=${url}, options: ${JSON.stringify(options)}`);
    return fetch(url, options);
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

export function get(target, body) {
    return xhr(target, 'GET', body);
}

//TODO: this is shit
export function credentials(a, c, u) {
    console.info(`credentials found: access-token=${a}, client=${c}, uid=${u}`);
    accessToken = a;
    client = c;
    uid = u;

}

