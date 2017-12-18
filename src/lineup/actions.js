// @flow

import * as Api from "../utils/Api";
import {Call} from "../utils/Api";
import type {Id, List, ms} from "../types";
import {CREATE_LINEUP, DELETE_LINEUP, EDIT_LINEUP, SAVE_ITEM} from "./actionTypes";
import {pendingActionWrapper} from "../utils/ModelUtils";


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


type LINEUP_DELETION_PAYLOAD = {lineupId: Id}
const LINEUP_DELETION = pendingActionWrapper(
    DELETE_LINEUP,
    (payload: LINEUP_DELETION_PAYLOAD) => new Call()
        .withMethod('DELETE')
        .withRoute(`lists/${payload.lineupId}`)
);


Api.registerCallFactory(CREATE_LINEUP, LINEUP_CREATION.call);
Api.registerCallFactory(DELETE_LINEUP, LINEUP_DELETION.call);

//list creation
export function createLineup(listName: string, delayMs: ms) {
    return LINEUP_CREATION.pending({listName}, {delayMs});
}

export function undoCreateLineup(lineupId: Id) {
    return LINEUP_CREATION.undo(lineupId);
}

//list deletion
export function deleteLineup(lineupId: string, delayMs: ms) {
    return LINEUP_DELETION.pending({lineupId}, {delayMs, lineupId});
}

export function undoDeleteLineup(pendingItemId: Id) {
    return LINEUP_DELETION.undo(pendingItemId);
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

// export function deleteLineup (lineupId: Id) {
//     let call = new Api.Call()
//         .withMethod('DELETE')
//         .withRoute(`lists/${lineupId}`);
//
//     return call.disptachForAction2(DELETE_LINEUP, {lineupId});
// }

export function patchLineup(editedLineup: List) {
    let call = new Api.Call()
        .withMethod('PATCH')
        .withRoute(`lists/${editedLineup.id}`)
        .withBody(editedLineup)
    ;
    return call.disptachForAction2(EDIT_LINEUP, {lineupId: editedLineup.id});
}





