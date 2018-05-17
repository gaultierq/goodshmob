// @flow


import type {Activity, Lineup} from "../types";
import {sanitizeActivityType} from "../helpers/DataUtils";
import {currentUserId} from "../managers/CurrentUser";
import {CREATE_LIKE, DELETE_LIKE} from "./activity/actionTypes";
import StoreManager from "../managers/StoreManager";

export class GAction {
    actionName: string;

    constructor(name: string) {
        this.actionName = name;
    }

    isActivityAction() {
        switch (this.actionName) {
            case 'like':
            case 'unlike':
            case 'save':
            case 'unsave':
            case 'buy':
            case 'share':
                return true;
            default:return false
        }
    }
    isListAction() {
        switch (this.actionName) {
            case 'share':
                return true;
            default:return false
        }
    }
}

//TODO: comments, see,
export const A_LIKE : GAction = new GAction('like');
export const A_UNLIKE : GAction = new GAction('unlike');
export const A_SAVE : GAction = new GAction('save');
export const A_UNSAVE : GAction = new GAction('unsave');
export const A_BUY : GAction = new GAction('buy');

//lineups
export const L_SHARE : GAction = new GAction('share list');
export const L_RENAME : GAction = new GAction('rename list');
export const L_DELETE : GAction = new GAction('delete list');
export const L_FOLLOW : GAction = new GAction('follow list');
export const L_UNFOLLOW : GAction = new GAction('unfollow list');

class LineupRights {
    lineup: Lineup;

    constructor(lineup: Lineup) {
        if (!lineup) throw "invalid params";
        this.lineup = lineup;
    }

    canShare() {
        return true
    }
}

class ActivityRights {

    activity: Activity;

    constructor(activity: Activity) {
        if (!activity) throw "invalid params";
        this.activity = activity;
    }

    canBuy() {
        let resource = this.activity.resource;
        return resource && sanitizeActivityType(resource.type) === 'creativeWorks';
    }

    canLike() {

        return !this.isAsk() && !this.liked();
    }

    canSave() {
        if (!this.activity.resource) return false;
        return !this.canUnsave();
    }

    canUnsave() {
        if (!this.activity.resource) return false;
        return this.isSavedByMe();
    }

    liked() {
        return this.activity.meta && this.activity.meta["liked"];
    }

    canUnlike() {
        return this.liked();
    }

    isAsk() {
        return sanitizeActivityType(this.activity.type) === 'asks';
    }


    byMe() {
        return this.activity.user.id === currentUserId();
    }

    //TODO: or is pending
    isSavedByMe() {
        let resource = this.activity.resource;
        return !_.isEmpty(StoreManager.getMySavingsForItem(resource.id, resource.type));
    }
}

export function canPerformAction(action: GAction, payload: {activity:? Activity, lineup:? Lineup}) {
    if (!action) throw 'invalid params';
    if (action.isActivityAction()) {
        if (!payload || !payload.activity) throw 'invalid params 2';
        let ar = new ActivityRights(payload.activity);
        switch (action.actionName) {
            case 'like':
                return ar.canLike();
            case 'unlike':
                return ar.canUnlike();
            case 'save':
                return ar.canSave();
            case 'unsave':
                return ar.canUnsave();
            case 'buy':
                return ar.canBuy();
            default:
                return false;
        }
    }
    if (action.isListAction()) {
        if (!payload || !payload.lineup) throw 'invalid params 3';
        let ar = new LineupRights(payload.lineup);
        switch (action.actionName) {
            case 'share':
                return ar.canShare();
            default:
                return false;
        }
    }
}


//TODO: probably move this somewhere
export function getPendingLikeStatus(pending, activity) {
    let pendingLikes = _.filter(pending[CREATE_LIKE], (o) => o.payload.activityId === activity.id);
    let pendingUnlikes = _.filter(pending[DELETE_LIKE], (o) => o.payload.activityId === activity.id);

    let both = _.concat(pendingLikes, pendingUnlikes);
    both = _.orderBy(both, 'insertedAt');
    let last = _.last(both);

    return last ? (last.pendingActionType === 'like' ? 1 : -1) : 0;
}