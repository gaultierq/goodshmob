// @flow

import {currentUser} from "./CurrentUser"
import Config from 'react-native-config'
import type {ms} from "../types"
import NotificationManager from './NotificationManager'
import {TipConfig} from "../ui/components/Tip"
import * as __ from "lodash";

const DISPLAYED = 'DISPLAYED';
const DISMISSED = 'DISMISSED';

export type InfoType = 'popular' | 'focus_add' | 'visibility' | 'noise' | 'private' | 'notification_permissions'
type InfoGroup = 'full_focus' | 'tip'

const TIME_BETWEEN_TIPS_MS = __.toNumber(Config.TIME_BETWEEN_TIPS_MS)
const TIP_DISPLAY_MAX_MS = __.toNumber(Config.TIP_DISPLAY_MAX_MS)

const ALL_INFOS = []


const add = (info: InfoConfig) => {
    ALL_INFOS.push(info)
    return info
}
type InfoConfig = {
    type: InfoType,
    group: InfoGroup,
    maxDisplay: ms,
    priority: number,
    skippable?: boolean,
    extraData?: any
}
type OnBoardingState = {
    [string]: {
        displayedAt?: ms,
        dismissedAt?: ms,
        skipped?: boolean
    }
}

const FOCUS_ADD: InfoConfig = add({
    type: 'focus_add',
    group: 'full_focus',
    maxDisplay: 0,
    priority: 3
})
const NOTIFICATION: InfoConfig = add({
    type: 'notification_permissions',
    group: 'full_focus',
    maxDisplay: 0,
    priority: 2
})
const POPULAR: InfoConfig = add({
    type: 'popular',
    group: 'full_focus',
    maxDisplay: 0,
    priority: 1,
})



const TIP_VISIBILITY: InfoConfig = add({
    type: 'visibility',
    group: 'tip',
    maxDisplay: 0,
    priority: 3,
    extraData: {
        type: 'visibility',
        keys: 'tips.visibility',
        materialIcon: 'lock',
    }
})
const TIP_NOISE: InfoConfig = add({
    type: 'noise',
    group: 'tip',
    maxDisplay: 0,
    priority: 4,
    extraData: {
        type: 'noise',
        keys: 'tips.noise',
        materialIcon: 'notifications-off',
    }
})
const TIP_FULL_PRIVATE: InfoConfig = add({
    type: 'private',
    group: 'tip',
    maxDisplay: 0,
    priority: 5,
    extraData: {
        type: 'private',
        keys: 'tips.full_private',
        materialIcon: 'lock',
    }
})



class _OnBoardingManager implements OnBoardingManager {
    id = Math.random();

    store: any;

    logger: GLogger

    constructor() {
    }

    init(store: any) {
        this.logger = logger.createLogger('OnBoarding')
        this.store = store;
    }

    getPendingInfo2(candidates, state, options) {
        let result
        let group = null
        let previous = []
        for (;; previous.push(result)) {
            result = candidates.shift()
            if (result) {
                if (!group) group = result.group

                if (this.hasBeenDismissed(result.type, state)) continue
                else if (this.shouldBeDisplayed(result.type, state, previous)) break
                else if (this.canBeSkipped(result)) continue
                else {
                    result = null
                    break
                }
            }
            else break
        }
        let type = null
        if (result && options && options.persistBeforeDisplay) {
            type = result.type
            if (!this.hasBeenDisplayed(type, state)) {
                this.onDisplayed(type)
            }
        }
        else type = null

        this.logger.debug("pending for", group, ": ", type)
        return result
    }

    async getCandidates(group: InfoGroup) {
        let candidates: InfoConfig[] = this.getAllCandidates(group)
        //https://github.com/facebook/flow/issues/5294
        let afterCandidates = await this.filterByRules(candidates)
        this.logger.debug("candidates filter", candidates, "=>", afterCandidates)
        candidates = afterCandidates
        return candidates
    }

    getAllCandidates(group: InfoGroup) {
        return ALL_INFOS.filter(i => i.group === group).sort((l, r) => l.priority - r.priority)
    }

    canBeSkipped(config: InfoConfig): boolean {
        return !!config.skippable
    }

    hasBeenDismissed(type: InfoType, state: OnBoardingState) {
        let stat = state[type]
        return stat && stat.dismissedAt
    }

    hasBeenDisplayed(type: InfoType, state: OnBoardingState) {
        let stat = state[type]
        return stat && stat.displayedAt
    }

    //based on visibility rules
    shouldBeDisplayed(type: InfoType, state: OnBoardingState, previous: InfoConfig[]) {
        let stat = state[type]
        switch (type) {
            case 'focus_add':
            case 'popular':
                //not already displayed, is head of group queue
                return !(stat && stat.displayedAt);
            case 'notification_permissions':
                return true
            case "noise":
            case "visibility":
            case "private":
                return this.shouldTipBeDisplayed(type, state, previous)

        }
    }


    shouldTipBeDisplayed(type: InfoType, state: OnBoardingState, previous) {

        let result
        let last = _.last(previous)
        if (last) {
            let lastStat = state[last.type]
            let lastDismissed = lastStat.dismissedAt || (lastStat.displayedAt + TIP_DISPLAY_MAX_MS)
            if (lastDismissed + TIME_BETWEEN_TIPS_MS > Date.now()) return false
        }

        let stat = state[type]
        if (stat) {
            //not already displayed
            if (!stat.displayedAt) result = true
            //displayed, but for a short time
            else result = stat.displayedAt + TIME_BETWEEN_TIPS_MS > Date.now()

        }
        else result = true
        return result
    }

//what can be shown, ignoring what was already shown
    async filterByRules(filterInfos: InfoConfig[] = ALL_INFOS): Promise<InfoConfig[]> {


        const displayableByRule = async function(info: InfoConfig): Promise<boolean> {
            switch (info.type) {
                case "focus_add":
                    // no conditions on user
                    return Promise.resolve(true);
                case "notification_permissions":
                    if (!__WITH_NOTIFICATIONS__) return Promise.resolve(false)
                    return NotificationManager.hasPermissions().then(result => !result)
                case "popular":

                    const user = currentUser(false)
                    let sCount = _.get(user, 'meta.savingsCount', -1);
                    return Promise.resolve(sCount === 0);
                case "noise":
                case "visibility":
                case "private":
                    return Promise.resolve(true)
                default:
                    return Promise.resolve(false)
            }
        }

        let selfIfDisplayable: InfoConfig => Promise<InfoConfig> = info => {
            return displayableByRule(info).then(result => result? info : null)
        }

        return Promise.all(filterInfos.map(info => selfIfDisplayable(info)))
            .then(result => result.filter(r => r != null))
    }

    createReducer() {
        return (state: any = {}, action: any) => {

            const stepName = action.step;
            let step = state[stepName] || {}
            switch (action.type) {
                case DISPLAYED:
                    state = {...state, [stepName]: {...step, displayedAt: action.at}}
                    break;
                case DISMISSED:
                    state = {...state, [stepName]: {...step, dismissedAt: action.at}}
                    break;
            }
            return state;
        }
    }

    onDisplayed(step: InfoType): void {
        this.store.dispatch({step, type: DISPLAYED, at: Date.now()});
    }

    postOnDismissed(step: InfoType): void {
        setTimeout(()=> {
            this.store.dispatch({step, type: DISMISSED, at: Date.now()});
        })

    }

}


export interface OnBoardingManager {

    init(store: any): void;

    getPendingStep(): ?InfoType;

    createReducer(): any;

    onDisplayed(step: InfoType): void;

    onDismissed(step: InfoType): void;

    shouldDisplayFocusAdd(): boolean;

}



module.exports = new _OnBoardingManager();
