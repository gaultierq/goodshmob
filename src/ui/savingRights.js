// @flow

import type {Lineup, Saving} from "../types"
import {sanitizeActivityType} from "../helpers/DataUtils"
import {currentUserId} from "../managers/CurrentUser"
import StoreManager from "../managers/StoreManager"

const GSavingActions = []

export class GSavingAction {

    name: string

    constructor(name: string, priority: number = 0) {
        this.name = name
        GSavingActions.push(this)
    }

    toString() {
        return "GSavingAction-" + this.name
    }

    canExec(activity: Saving) {
        return new SavingRights(activity).canExec(this)
    }

}


export class SavingRights {
    saving: Saving
    pending: ?any

    constructor(activity: Saving, pending?: any) {
        if (!activity) throw "invalid params"
        this.saving = activity
        this.pending = pending
    }

    canExec(action: GSavingAction): boolean {

        switch (action) {
            case A_LIKE:
                return !this.isAsk() && !this.liked()
            case A_UNLIKE:
                return this.liked()
            case A_SAVE:
                if (!this.saving.resource) return false;
                return !this.canUnsave();
            case A_UNSAVE:
                return this.canUnsave()
            case A_BUY:
                let resource = this.saving.resource;
                return resource && sanitizeActivityType(resource.type) === 'creativeWorks';
            default:
                throw `unknown action ${action}`
        }
    }

    static getActions(lineup: Lineup, pending?: any): GSavingAction[] {
        let rights = new SavingRights(lineup, pending)
        return GSavingActions.filter(a => rights.canExec(a))
    }



    ///

    canUnsave() {
        if (!this.saving.resource) return false;
        return this.isSavedByMe();
    }

    liked() {
        return this.saving.meta && this.saving.meta["liked"];
    }

    canUnlike() {
        return this.liked();
    }

    isAsk() {
        return sanitizeActivityType(this.saving.type) === 'asks';
    }


    byMe() {
        return this.saving.user.id === currentUserId();
    }

    //TODO: or is pending
    isSavedByMe() {
        let resource = this.saving.resource;
        return !_.isEmpty(StoreManager.getMySavingsForItem(resource.id, resource.type));
    }

    ///
}

//TODO: comments, see,
export const A_LIKE: GSavingAction = new GSavingAction('like', 1)
export const A_UNLIKE: GSavingAction = new GSavingAction('unlike', 4)
export const A_SAVE: GSavingAction = new GSavingAction('save', -1)
export const A_UNSAVE: GSavingAction = new GSavingAction('unsave', 3)
export const A_BUY: GSavingAction = new GSavingAction('buy', 2)
