// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"
import { CALL_API } from 'redux-api-middleware'
import normalize from 'json-api-normalizer';
import { API_SYMBOL } from '../middleware/apiMiddleware'

export function loadFriend(userId: string) {
    let call = new Api.Call()
        .withRoute(`users/${userId}/friends`)
        .withQuery({
            page: 1,
            per_page: 10,
            include: "creator"
        });

    return {
        [CALL_API]: {
            endpoint: call.getUrl(),
            method: "GET",
            headers: Api.headers(),
            types: [
                {
                    type: types.LOAD_FRIENDS.request(),
                    [API_SYMBOL]: {
                        isRequest: true,
                        endpoint: call.getUrl()
                    }
                },
                {
                    type: types.LOAD_FRIENDS.success(),
                    [API_SYMBOL]: {isRequest: false, endpoint: call.getUrl()}
                },
                {
                    type: types.LOAD_FRIENDS.failure(),
                    [API_SYMBOL]: {isRequest: false, endpoint: call.getUrl()}
                }
            ],
        }
    };
}

export function loadMoreFriend(nextUrl:string) {
    let call = new Api.Call.parse(nextUrl)
        .withQuery({include: "user,resource,target"});

    return Api.createSimpleApiCall2(call.getUrl(), types.LOAD_MORE_FRIENDS);
}

