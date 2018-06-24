// @flow

import * as Api from "../../managers/Api"
import {Call} from "../../managers/Api"
import type {Id, ItemType, List, ms} from "../../types"
import {CREATE_LINEUP, DELETE_LINEUP, EDIT_LINEUP, SAVE_ITEM} from "./actionTypes"
import type {PendingAction} from "../../helpers/ModelUtils"
import {pendingActionWrapper} from "../../helpers/ModelUtils"
import type {Visibility} from "../screens/additem"
import ApiAction from "../../helpers/ApiAction"
import {UNSAVE} from "../activity/actionTypes"
import {Alert} from "react-native"
import Snackbar from "react-native-snackbar"
import type {LineupActionParams} from "../Nav"
import _Messenger from "../../managers/Messenger"

export const FETCH_LINEUP = ApiAction.create("fetch_lineup", "retrieve a lineup details");
export const FETCH_SAVINGS = ApiAction.create("fetch_savings", "retrieve savings info");

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
    return call.createActionDispatchee(EDIT_LINEUP, {lineupId: editedLineup.id});
}

export function doUnsave(pending, id, lineupId, delayMs?: ms) {
    return pending ? CREATE_SAVING.undo(id) : SAVING_DELETION.pending(
        {savingId: id, lineupId},
        {delayMs, id, lineupId, scope: {activityId: id, lineupId}});
}



export function deleteLineup({dispatch, lineup}: LineupActionParams) {
    let delayMs = 3000;
    //deleteLineup(lineup.id, delayMs)
    const lineupId = lineup.id;
    return Alert.alert(
        i18n.t("alert.delete.title"),
        i18n.t("alert.delete.label"),
        [
            {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: i18n.t("actions.ok"), onPress: () => {
                    dispatch(LINEUP_DELETION.pending({lineupId}, {delayMs, lineupId}))
                        .then(pendingId => {
                            Snackbar.show({
                                    title: i18n.t("activity_item.buttons.deleted_list"),
                                    duration: Snackbar.LENGTH_LONG,
                                    action: {
                                        title: i18n.t("actions.undo"),
                                        color: 'green',
                                        onPress: () => {
                                            dispatch(LINEUP_DELETION.undo(pendingId))
                                        },
                                    },
                                }
                            );
                        });
                }
            },
        ],
        { cancelable: true }
    );
}

export const FOLLOW_LINEUP = ApiAction.create("follow_lineup", "follow a lineup");
export const UNFOLLOW_LINEUP = ApiAction.create("unfollow_lineup", "unfollow a lineup");


export function fetchLineup(lineupId: string): Call {
    return new Api.Call().withMethod('GET')
        .withRoute(`lists/${lineupId}`)
        .addQuery({
            include: "savings,savings.user,savings.resource"
        });
}

export const FOLLOW_LINEUP_PENDING: PendingAction<List>  = pendingActionWrapper(
    FOLLOW_LINEUP,
    (lineup: List) => new Api.Call().withMethod('POST')
        .withRoute(`lists/${lineup.id}/follows`)
);

export function followLineupPending(dispatch, lineup) {
    let delayMs = 4000;

    return dispatch(FOLLOW_LINEUP_PENDING.pending({id: lineup.id}, {
            scope: {lineupId: lineup.id},
            delayMs: delayMs
        }
    )).then(pendingId => {
        _Messenger.sendMessage(
            i18n.t('follow.messages.followed'),
            {
                timeout: delayMs,
                action: {
                    title: i18n.t('actions.undo'),
                    onPress: () => {
                        dispatch(FOLLOW_LINEUP_PENDING.undo(pendingId));
                    },
                }}
        );
    });

}


export const UNFOLLOW_LINEUP_PENDING: PendingAction<List>  = pendingActionWrapper(
    UNFOLLOW_LINEUP,
    (lineup: List) => new Api.Call().withMethod('DELETE')
        .withRoute(`lists/${lineup.id}/follows`)
);

export function unfollowLineupPending(dispatch, lineup) {
    let delayMs = 4000;

    Alert.alert(
        i18n.t("follow.alert.title_unfollow"),
        i18n.t("friends.alert.label"),
        [
            {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: i18n.t("actions.ok"), onPress: () => {
                    dispatch(UNFOLLOW_LINEUP_PENDING.pending({id: lineup.id}, {
                            scope: {lineupId: lineup.id},
                            delayMs: delayMs
                        }
                    )).then(pendingId => {
                        _Messenger.sendMessage(
                            i18n.t('follow.messages.unfollowed'),
                            {
                                timeout: delayMs,
                                action: {
                                    title: i18n.t('actions.undo'),
                                    onPress: () => {
                                        //undo previous add
                                        dispatch(UNFOLLOW_LINEUP_PENDING.undo(pendingId));
                                    },
                                }}
                        );
                    });
                }},
        ],
        { cancelable: true }
    )
}