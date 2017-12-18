// @flow

import * as Api from "../utils/Api";
import {Call} from "../utils/Api";
import type {Id, List, ms} from "../types";
import {CREATE_PENDING_ACTION, REMOVE_PENDING_ACTION} from "../reducers/dataReducer";
import {CREATE_LINEUP, DELETE_LINEUP, EDIT_LINEUP, SAVE_ITEM} from "./actionTypes";


Api.registerCallFactory(
    CREATE_LINEUP, (payload) => new Call()
        .withMethod('POST')
        .withRoute("lists")
        .withBody({
            "list": {
                "name": payload.listName
            }
        })
);


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

export function createLineup(listName: string, delayMs: ms) {

    return (dispatch) => new Promise((resolve, reject)=> {

            let payload = {
                id: `pendingList-${Math.random()}`,
                listName,
            };
            dispatch({
                type: CREATE_PENDING_ACTION,
                pendingActionType: CREATE_LINEUP,
                payload,
                delayMs
            });
            resolve(payload);
        }
    )
}
export function undoCreateLineup(lineupId: Id) {
    return {
        type: REMOVE_PENDING_ACTION,
        pendingActionType: CREATE_LINEUP,
        id: lineupId
    };
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





