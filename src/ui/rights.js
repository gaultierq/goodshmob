// @flow


import type {Activity} from "../types";
import {sanitizeActivityType} from "../helpers/DataUtils";

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

    liked() {
        return this.activity.meta && this.activity.meta["liked"];
    }

    canUnlike() {
        return this.liked();
    }

    isAsk() {
        return this.activity.type === 'asks';
    }
}