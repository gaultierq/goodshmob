// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"
let fixtures = require("../fixtures/activities_fixtures2.json");
import { CALL_API } from 'redux-api-middleware'

let execLoad = function (url, type) {
    return {
        [CALL_API]: {
            endpoint: url,
            method: "GET",
            headers: Api.headers(),
            types: [
                type.request(),
                {
                    type: type.success(),
                    payload: (action, state, res) => {

                        return res.json().then((payload) => {
                            return {
                                activities: Util.parse(payload),
                                links: payload.links
                            };
                        });

                    },
                },
                type.failure()
            ],
        }
    };
};

export function loadFeed() {
    let call = new Api.Call()
        .withRoute("activities")
        .withQuery({include: "user,resource,target"});

    return execLoad(call.getUrl(), types.LOAD_FEED);
}

export function loadMoreFeed(nextUrl:string) {
    let call = new Api.Call.parse(nextUrl)
        .withQuery({include: "user,resource,target"});

    return execLoad(call.getUrl(), types.LOAD_MORE_FEED);
}



