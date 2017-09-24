// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"
import { CALL_API } from 'redux-api-middleware'

export function loadLineups() {
    let call = new Api.Call()
        .withRoute("lists")
        .withQuery({
            page: 1,
            per_page: 10,
            include: "creator"
        });

    return Api.createSimpleApiCall2(call.getUrl(), types.FETCH_LINEUPS);
}

export function loadMoreLineups(nextUrl:string) {
    let call = new Api.Call.parse(nextUrl)
        .withQuery({include: "user,resource,target"});

    return Api.createSimpleApiCall2(call.getUrl(), types.FETCH_MORE_LINEUPS);
}


export function fetchLineup(lineupId: string) {
    return Api.createSimpleApiCall(`lists/${lineupId}`, 'GET', types.FETCH_LINEUP, {id: lineupId});
}

