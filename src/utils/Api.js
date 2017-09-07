let xhr = function (verb, method, body) {
    let apiEndpoint = "https://goodshitapp-staging.herokuapp.com/";

    let bodyStr = JSON.stringify(body);
    console.log("request body: " + body);

    return fetch(
        apiEndpoint + verb,
        {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: bodyStr
        });
};

export function post(target, body) {
    return xhr(target, 'POST', body);
}

export function get(target, body) {
    return xhr(target, 'GET', body);
}

