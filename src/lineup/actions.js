// @flow

import * as Api from "../utils/Api";
import {Call} from "../utils/Api";
import type {Id, List, ms} from "../types";
import {CREATE_PENDING_ACTION, REMOVE_PENDING_ACTION} from "../reducers/dataReducer";
import {CREATE_LINEUP, DELETE_LINEUP, EDIT_LINEUP, SAVE_ITEM} from "./actionTypes";
import ApiAction from "../utils/ApiAction";


//defining lineup creation cycle
type LINEUP_CREATION_PAYLOAD = {listName: string}
const LINEUP_CREATION = pendingActionWrapper(
    CREATE_LINEUP,
    (payload: LINEUP_CREATION_PAYLOAD) => new Call()
        .withMethod('POST')
        .withRoute("lists")
        .withBody({
            "list": {
                "name": payload.listName
            }
        })
);


//     {
//
//     pending: (listName: string, delayMs: ms) => (dispatch) => new Promise((resolve, reject)=> {
//
//             let payload: LINEUP_CREATION_PAYLOAD = {
//                 listName,
//             };
//             dispatch({
//                 type: CREATE_PENDING_ACTION,
//                 pendingActionType: CREATE_LINEUP,
//                 payload,
//                 delayMs
//             });
//             resolve(payload);
//         }
//     ),
//     call: (payload) => new Call()
//         .withMethod('POST')
//         .withRoute("lists")
//         .withBody({
//             "list": {
//                 "name": payload.listName
//             }
//         }),
//     undo: (lineupId: Id) => ({
//         type: REMOVE_PENDING_ACTION,
//         pendingActionType: CREATE_LINEUP,
//         id: lineupId
//     })
// };


function pendingActionWrapper<Payload>(
    action: ApiAction,
    callFactory: (payload: Payload) => Call
) {

    return {
        pending: (payload: Payload, delayMs: ms) => (dispatch:any) => new Promise((resolve, reject)=> {
                //let payload = payloadFactory();
                dispatch({
                    type: CREATE_PENDING_ACTION,
                    pendingActionType: action,
                    payload,
                    delayMs
                });
                resolve(payload);
            }
        ),
        call: callFactory,
        undo: (pendingId: Id) => ({
            type: REMOVE_PENDING_ACTION,
            pendingActionType: action,
            id: pendingId
        })
    };
}

Api.registerCallFactory(
    CREATE_LINEUP, LINEUP_CREATION.call
);


export function createLineup(listName: string, delayMs: ms) {
    return LINEUP_CREATION.pending({listName}, delayMs);
}

export function undoCreateLineup(lineupId: Id) {
    return LINEUP_CREATION.undo(lineupId);
}

export function saveItem(itemId: Id, lineupId: Id, privacy = 0, description = '') {

    let body = {
        saving: { list_id: lineupId, privacy}
    };
    if (description) {
        Object.assign(body.saving, {description});
    }
    console.log("saving item, with body:");
    console.log(body);

    let call = new Api.Call()
        .withMethod('POST')
        .withRoute(`items/${itemId}/savings`)
        .withBody(body)
        .addQuery({'include': '*.*'});

    return call.disptachForAction2(SAVE_ITEM, {lineupId});
}

export function fetchItemCall(itemId: Id) {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`items/${itemId}`)
        .addQuery({'include': '*.*'});
}


export function deleteLineup (lineupId: Id) {
    let call = new Api.Call()
        .withMethod('DELETE')
        .withRoute(`lists/${lineupId}`);

    return call.disptachForAction2(DELETE_LINEUP, {lineupId});
}

export function patchLineup(editedLineup: List) {
    let call = new Api.Call()
        .withMethod('PATCH')
        .withRoute(`lists/${editedLineup.id}`)
        .withBody(editedLineup)
    ;
    return call.disptachForAction2(EDIT_LINEUP, {lineupId: editedLineup.id});
}





