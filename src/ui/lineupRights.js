// @flow

import type {Lineup} from "../types"
import {isCurrentUser} from "../managers/CurrentUser"
import StoreManager from "../managers/StoreManager"
import {buildData} from "../helpers/DataUtils"

export const GLineupActions = []

export class GLineupAction {

    name: string
    priority: number

    constructor(name: string, priority: number = 0) {
        this.name = name
        this.priority = priority
        GLineupActions.push(this)
    }

    toString() {
        return "GLineupAction-" + this.name
    }

}

// add_item_into
export const L_SHARE: GLineupAction = new GLineupAction('share list', -2)
export const L_ADD_ITEM: GLineupAction = new GLineupAction('add item', -2)
export const L_RENAME: GLineupAction = new GLineupAction('rename list', 1)
export const L_DELETE: GLineupAction = new GLineupAction('delete list', 2)
export const L_FOLLOW: GLineupAction = new GLineupAction('follow list', -3)
export const L_UNFOLLOW: GLineupAction = new GLineupAction('unfollow list', 4)

// return null if we don't know (eg: when item is pending)
export function isFollowed(lineup: Lineup, pending?: any) {
    if (StoreManager.isListPendingFollowOrUnfollow(lineup.id, pending)) return null
    return _.get(lineup, 'meta.followed')
}

export class LineupRights {
    lineup: Lineup
    pending: ?any

    constructor(lineup: Lineup, pending?: any) {
        if (!lineup) throw "invalid params"
        this.lineup = lineup
        this.pending = pending
    }

    static create(lineupId, state) {
        //dummy
        let r = new LineupRights({}, null)
        r.lineup = buildData(state.data, 'lists', lineupId)
        r.pending = state.pending
        return r
    }

    canExec(action: GLineupAction): boolean {
        const l = this.lineup
        if (!l) return false
        let isMine = isCurrentUser(l.user)
        const followed = isFollowed(l, this.pending)

        switch (action) {
            case L_SHARE:
                return true
            case L_RENAME:
                return isMine
            case L_ADD_ITEM:
                return isMine
            case L_DELETE:
                return isMine
            case L_FOLLOW:
                return !isMine && followed === false
            case L_UNFOLLOW:
                return !isMine && followed === true
            default:
                throw `unknown action ${action}`
        }
    }

    allActions() {
        return GLineupActions.filter(a => this.canExec(a))
    }

    static getActions(lineup: Lineup, pending?: any): GLineupAction[] {
        let rights = new LineupRights(lineup, pending)
        return GLineupActions.filter(a => rights.canExec(a))
    }
}
