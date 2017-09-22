// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import * as Util from "../utils/ModelUtils"
let fixtures = require("../fixtures/activities_fixtures2.json");

export function fetchActivities(callback?) {
    return async (dispatch, getState) => {

        let call = new Api.Call()
            .withRoute("activities")
            .withQuery({include: "user,resource,target"});


        submit(call, dispatch, callback);

        // dispatch({
        //     type: types.APPEND_FETCHED_ACTIVITIES,
        //     activities: Util.parse(fixtures)
        // });
    };
}

export function fetchMoreActivities(nextUrl:string, onFinished?) {
    return async (dispatch, getState) => {

        let call = new Api.Call.parse(nextUrl)
            .withQuery({include: "user,resource,target"});

        submit(call, dispatch, onFinished);
    };
}

let submit = function (call, dispatch, onFinished) {
    call.get()
        .then((response) => {

            dispatch({
                type: types.APPEND_FETCHED_ACTIVITIES,
                activities: Util.parse(response),
                links: response.links});
        })
        .catch((err) => {
            console.error(err);
        })
        .then(() => {
            onFinished && onFinished();
        });
};



