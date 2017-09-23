// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"
import { CALL_API } from 'redux-api-middleware'

let execLoad = function (url, type) {
    return {[CALL_API]: {
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
};

export function loadLineup() {
    let call = new Api.Call()
        .withRoute("lists")
        .withQuery({
            page: 1,
            per_page: 10,
            include: "creator"
        });

    return execLoad(call.getUrl(), types.LOAD_LINEUPS);
}

export function loadMoreLineup(nextUrl:string) {
    let call = new Api.Call.parse(nextUrl)
        .withQuery({include: "user,resource,target"});

    return execLoad(call.getUrl(), types.LOAD_MORE_LINEUPS);
}

