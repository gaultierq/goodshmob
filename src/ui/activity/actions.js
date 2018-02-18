// @flow
import * as types from "./actionTypes"
import * as Api from "../../managers/Api";
import {sanitizeActivityType} from "../../helpers/DataUtils";
import type {ActivityType, Id} from "../../types";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";


export function fetchActivity(activityId: Id, activityType: ActivityType, options?:any = {}) {
    if (!activityId || !activityType) throw "invalid params";
    let type = sanitizeActivityType(activityType);

    let {include} = options;

    return new Api.Call()
        .withMethod('GET')
        .withRoute(`${type}/${activityId}`)
        .include(include)
        .disptachForAction2(types.FETCH_ACTIVITY,
            {id: activityId, type: activityType}
        );
}

//defining lineup creation cycle
type LIKE_CREATION_PAYLOAD = {activityId:Id, activityType: ActivityType}
export const LIKE_CREATION : PendingAction<LIKE_CREATION_PAYLOAD> = pendingActionWrapper(
    types.CREATE_LIKE,
    ({activityId, activityType}: LIKE_CREATION_PAYLOAD) =>  new Api.Call()
        .withMethod('POST')
        .withRoute(`${sanitizeActivityType(activityType)}/${activityId}/likes`)
);

//defining lineup creation cycle
type LIKE_DELETION_PAYLOAD = {activityId:Id, activityType: ActivityType}
export const LIKE_DELETION : PendingAction<LIKE_DELETION_PAYLOAD> = pendingActionWrapper(
    types.DELETE_LIKE,
    ({activityId, activityType}: LIKE_DELETION_PAYLOAD) =>  new Api.Call()
        .withMethod('DELETE')
        .withRoute(`${sanitizeActivityType(activityType)}/${activityId}/likes`)
);


export function like(activityId: string, activityType: string) {
    return LIKE_CREATION.pending({activityId, activityType}, {id: activityId, type: activityType});
}

export function unlike(activityId: string, activityType: string) {
    return LIKE_DELETION.pending({activityId, activityType}, {id: activityId, type: activityType});
}

export function unsave(savingId: Id, lineupId: Id) {
    return new Api.Call()
        .withMethod('DELETE')
        .withRoute(`savings/${savingId}`)
        .disptachForAction2(types.UNSAVE,
            {id: savingId, lineupId}
        );
}


