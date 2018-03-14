// @flow

import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import type {Id, ItemType, List, ms} from "../../types";
import {CREATE_LINEUP, DELETE_LINEUP, EDIT_LINEUP, SAVE_ITEM} from "./actionTypes";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import type {Visibility} from "../screens/additem";
import ApiAction from "../../helpers/ApiAction";
import {UNSAVE} from "../activity/actionTypes";

export const FETCH_LINEUP = ApiAction.create("fetch_lineup");
export const FETCH_SAVINGS = ApiAction.create("fetch_savings");

//defining lineup creation cycle
type LINEUP_CREATION_PAYLOAD = {listName: string}
export const LINEUP_CREATION : PendingAction<LINEUP_CREATION_PAYLOAD> = pendingActionWrapper(
    CREATE_LINEUP,
    (payload: LINEUP_CREATION_PAYLOAD) => new Call()
        .withMethod('POST')
        .withRoute("lists")
        .withBody({
            "list": {
                "name": payload.listName
            }
        }),
);

type LINEUP_DELETION_PAYLOAD = {lineupId: Id}

export const LINEUP_DELETION: PendingAction<LINEUP_DELETION_PAYLOAD>  = pendingActionWrapper(
    DELETE_LINEUP,
    (payload: LINEUP_DELETION_PAYLOAD) => new Call()
        .withMethod('DELETE')
        .withRoute(`lists/${payload.lineupId}`)
);

export function saveItem(itemId: Id, lineupId: Id, privacy = 0, description = '') {

    let body = {
        saving: { list_id: lineupId, privacy, description}
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

//save
// export function bookmarkDispatchee(payload: SAVING_CREATION_PAYLOAD) {
//
//     return CREATE_SAVING.pending(payload, {scope: {itemId: payload.itemId, lineupId: payload.lineupId}});
// }

export type SAVING_CREATION_PAYLOAD = {itemId: Id, itemType: ItemType, lineupId: Id, privacy: Visibility, description: string}

export const CREATE_SAVING: PendingAction<SAVING_CREATION_PAYLOAD>  = pendingActionWrapper(
    SAVE_ITEM,
    ({itemId, lineupId, privacy, description}: SAVING_CREATION_PAYLOAD) => new Api.Call()
        .withMethod('POST')
        .withRoute(`items/${itemId}/savings`)
        .withBody({saving: { list_id: lineupId, privacy, description}})
        .addQuery({'include': '*.*'})
);

export type SAVING_DELETION_PAYLOAD = {savingId: Id, lineupId: Id}

export const SAVING_DELETION: PendingAction<SAVING_DELETION_PAYLOAD>  = pendingActionWrapper(
    UNSAVE,
    ({savingId, lineupId}: SAVING_DELETION_PAYLOAD) => new Api.Call()
        .withMethod('DELETE')
        .withRoute(`savings/${savingId}`)
);

export function fetchItemCall(itemId: Id) {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`items/${itemId}`)
        .addQuery({'include': '*.*'});
}

export function patchLineup(editedLineup: List) {
    let call = new Api.Call()
        .withMethod('PATCH')
        .withRoute(`lists/${editedLineup.id}`)
        .withBody(editedLineup)
    ;
    return call.disptachForAction2(EDIT_LINEUP, {lineupId: editedLineup.id});
}

export function doUnsave(pending, id, lineupId, delayMs?: ms) {
    return pending ? CREATE_SAVING.undo(id) : SAVING_DELETION.pending(
        {savingId: id, lineupId},
        {delayMs, id, lineupId, scope: {activityId: id, lineupId}});
}

