// @flow


import type {Activity} from "../types";
import {sanitizeActivityType} from "../helpers/DataUtils";
import {currentUserId} from "../managers/CurrentUser";
import {CREATE_LIKE, DELETE_LIKE} from "./activity/actionTypes";

export default class ActionRights {

    activity: Activity;

    constructor(activity: Activity) {
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
        return this.isGoodshedByMe();
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
    isGoodshedByMe() {
        let resource = this.activity.resource;

        //savedIn = not only my lists... server fail
        let savedIn = _.get(resource, 'meta.savedIn', []);
        return !_.isEmpty(savedIn);

        // let target = this.activity.target;
        // let goodshed;
        // if (target && target.type === 'lists') {
        //     goodshed = _.indexOf(savedIn, target.id) > -1;
        // }
        // return goodshed;
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