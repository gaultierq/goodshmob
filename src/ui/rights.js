// @flow


import type {Activity} from "../types";
import {sanitizeActivityType} from "../helpers/DataUtils";
import {currentUserId} from "../managers/CurrentUser";
import {CREATE_LIKE, DELETE_LIKE} from "./activity/actionTypes";
import StoreManager from "../managers/StoreManager";

export default class ActionRights {

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
        // let mySavings = _.get(resource, 'meta.mySavings', []);
        // if (!_.isEmpty(mySavings)) return true;
        // if (StoreManager.isItemPendingAdd(resource.id)) return true;
        return !_.isEmpty(StoreManager.getMySavingsForItem(resource.id, resource.type));
    }
}

export function getPendingLikeStatus(pending, activity) {
    let pendingLikes = _.filter(pending[CREATE_LIKE], (o) => o.payload.activityId === activity.id);
    let pendingUnlikes = _.filter(pending[DELETE_LIKE], (o) => o.payload.activityId === activity.id);

    let both = _.concat(pendingLikes, pendingUnlikes);
    both = _.orderBy(both, 'insertedAt');
    let last = _.last(both);

    return last ? (last.pendingActionType === 'like' ? 1 : -1) : 0;
}