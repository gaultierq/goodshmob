// @flow

import type {User} from "../types"
import {isCurrentUser} from "../managers/CurrentUser"
import {GAction} from "./rights"

const GUserActions = []

export class GUserAction extends GAction {

    constructor(name: string, priority: number = 0) {
        super(name, priority)
        GUserActions.push(this)
    }

    toString() {
        return "GUserAction-" + this.name
    }
}

export const U_CONNECT: GUserAction = new GUserAction('connect to user', -1)
export const U_DISCONNECT: GUserAction = new GUserAction('disconnect from user', 3)


export class UserRights {
    user: User
    pending: any

    constructor(user: User, pending?: any) {
        if (!user) throw "invalid params"
        this.user = user
        this.pending = pending
    }

    canExec(action: GUserAction): boolean {
        const l = this.user
        if (!l) return false
        let isMe = isCurrentUser(l.user)
        const connected = _.get(this.user, 'meta.followed');

        switch (action) {
            case U_CONNECT:
                return !isMe && connected === false
            case U_DISCONNECT:
                return !isMe && connected === true
            default:
                throw `unknown action` + action
        }
    }
}

export function getUserActions(user: User, pending?: any): GUserAction[] {
    let rights = new UserRights(user, pending)
    return GUserActions.filter(a => rights.canExec(a))
}
export function canExecUserAction(action: GUserAction, user: User): boolean {
    return new UserRights(user).canExec(action)
}
