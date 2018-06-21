// @flow

import type {Lineup} from "../types"
import {isCurrentUser} from "../managers/CurrentUser"
import {isFollowed} from "./activity/components/FollowButton"
import {GAction} from "./rights"

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

// add_item_into
export const L_ADD_ITEM: GLineupAction = new GLineupAction('add item')
export const L_SHARE: GLineupAction = new GLineupAction('share list')
export const L_RENAME: GLineupAction = new GLineupAction('rename list')
export const L_DELETE: GLineupAction = new GLineupAction('delete list')
export const L_FOLLOW: GLineupAction = new GLineupAction('follow list')
export const L_UNFOLLOW: GLineupAction = new GLineupAction('unfollow list')

export class LineupRights {
    lineup: Lineup

    constructor(lineup: Lineup) {
        if (!lineup) throw "invalid params"
        this.lineup = lineup
    }

    canExec(action: GLineupAction): boolean {
        const l = this.lineup
        if (!l) return false
        let isMine = isCurrentUser(l.user)
        const followed = isFollowed(l)

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

    static getActions(lineup: Lineup): GLineupAction[] {
        let rights = new LineupRights(lineup)
        return GLineupActions.filter(a => rights.canExec(a))
    }
}