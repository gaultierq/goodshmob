// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"
let fixtures = require("../fixtures/activities_fixtures2.json");
import { CALL_API } from 'redux-api-middleware'

export function loadFeed() {
    let call = new Api.Call()
        .withRoute("activities")
        .withQuery({include: "user,resource,target"});

    return {
        [CALL_API]: {
            endpoint: call.getUrl(),
            method: "GET",
            headers: Api.headers(),
            types: [
                types.LOAD_FEED.request(),
                {
                    type: types.LOAD_FEED.success(),
                    payload: (action, state, res) => {

                        return res.json().then((payload) => {
                            return {
                                activities: Util.parse(payload),
                                links: payload.links
                            };
                        });

                    },
                },
                types.LOAD_FEED.failure()
            ],
        }
    };
}

export function loadMoreFeed(nextUrl:string) {
    let call = new Api.Call.parse(nextUrl)
        .withQuery({include: "user,resource,target"});

    return {
        [CALL_API]: {
            endpoint: call.getUrl(),
            method: "GET",
            headers: Api.headers(),
            types: [
                types.LOAD_MORE_FEED.request(),
                {
                    type: types.LOAD_MORE_FEED.success(),
                    payload: (action, state, res) => {

                        return res.json().then((payload) => {
                            return {
                                activities: Util.parse(payload),
                                links: payload.links
                            };
                        });

                    },
                },
                types.LOAD_MORE_FEED.failure()
            ],
        }
    };
}



