// @flow


import type {Activity, Lineup} from "../types";
import {sanitizeActivityType} from "../helpers/DataUtils";
import {currentUserId, isCurrentUser} from "../managers/CurrentUser";
import {CREATE_LIKE, DELETE_LIKE} from "./activity/actionTypes";
import StoreManager from "../managers/StoreManager";
import {isFollowed} from "./activity/components/FollowButton";

export class GAction {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    toString() {
        return "GAction-" + this.name
    }

    isActivityAction() {
        switch (this.name) {
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
        switch (this.name) {
            case 'share':
                return true;
            default:return false
        }
    }
}


const GLineupActions = []
class GLineupAction extends GAction {

    constructor(name: string) {
        super(name)
        GLineupActions.push(this)
    }



    toString() {
        return "GLineupAction-" + this.name
    }

}

//TODO: comments, see,
export const A_LIKE : GAction = new GAction('like');
export const A_UNLIKE : GAction = new GAction('unlike');
export const A_SAVE : GAction = new GAction('save');
export const A_UNSAVE : GAction = new GAction('unsave');
export const A_BUY : GAction = new GAction('buy');



//lineups
export const L_SHARE : GAction = new GLineupAction('share list');
export const L_RENAME : GAction = new GLineupAction('rename list');
export const L_DELETE : GAction = new GLineupAction('delete list');
export const L_FOLLOW : GAction = new GLineupAction('follow list');
export const L_UNFOLLOW : GAction = new GLineupAction('unfollow list');

export class LineupRights {
    lineup: Lineup;

    constructor(lineup: Lineup) {
        if (!lineup) throw "invalid params";
        this.lineup = lineup;
    }

    canShare() {
        return true
    }

    canExec(action: GLineupAction): boolean {
        const l = this.lineup;
        if (!l) return false
        let isMine = isCurrentUser(l.user)
        const followed = isFollowed(l, true)

        switch (action) {
            case L_SHARE:
                return true
            case L_RENAME:
                return isMine
            case L_DELETE:
                return isMine
            case L_FOLLOW:
                return !isMine && followed === false
            case L_UNFOLLOW:
                return !isMine && followed === true
            default: throw `unknown action ${action}`
        }
    }

    static getActions(lineup: Lineup): GLineupAction[] {
        let rights = new LineupRights(lineup)
        return GLineupActions.filter(a => rights.canExec(a))
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
        switch (action.name) {
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
        switch (action.name) {
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
