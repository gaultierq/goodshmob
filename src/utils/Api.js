
export function prepareCall(verb, token) {
    let apiEndpoint = "https://goodshitapp-staging.herokuapp.com/";

    return fetch(
        apiEndpoint + verb,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({auth: {access_token: token}})
        });
}
