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

const ALL_INFOS = [
    {
        type: 'popular',
        group: 'full_focus',
        maxDisplay: 0,
        priority: 1,
    },
    {
        type: 'focus_add',
        group: 'full_focus',
        maxDisplay: 0,
        priority: 2
    },
    {
        type: 'notification_permissions',
        group: 'full_focus',
        maxDisplay: 0,
        priority: 3
    },
    {
        type: 'visibility',
        group: 'tip',
        maxDisplay: 0,
        priority: 4,
        extraData: {
            type: 'visibility',
            keys: 'tips.visibility',
            materialIcon: 'lock',
        }
    },
    {
        type: 'noise',
        group: 'tip',
        maxDisplay: 0,
        priority: 5,
        extraData: {
            type: 'noise',
            keys: 'tips.noise',
            materialIcon: 'notifications-off',
        }
    },
    {
        type: 'private',
        group: 'tip',
        maxDisplay: 0,
        priority: 6,
        extraData: {
            type: 'private',
            keys: 'tips.full_private',
            materialIcon: 'lock',
        }
    }
]

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

    getPendingInfo(state: any, options: any) {

        let candidates: InfoConfig[] = ALL_INFOS
            .sort((l, r) => l.priority - r.priority)
            // .filter(i => i.group === group)
            .filter(this._displayableByRule)

        let result
        let previous: Array<InfoConfig> = []
        let {group, persistBeforeDisplay} = options || {}

        // $FlowFixMe
        for (;; previous.push(result)) {
            result = candidates.shift()
            if (result) {
                if (this.hasBeenDismissed(result.type, state)) continue
                if (this.shouldBeDisplayed(result.type, state, previous)) {
                    if (group && group === result.group) break
                }
                if (this.hasBeenSeenLongEnough(result, state)) continue
                if (this.canBeSkipped(result)) continue
                result = null
                break
            }
            else break
        }
        let type = null
        if (result && persistBeforeDisplay) {
            type = result.type
            if (!this.hasBeenDisplayed(type, state)) {
                this.onDisplayed(type)
            }
        }
        else type = null

        this.logger.debug("pending for", group, ": ", type)
        return result
    }

    canBeSkipped(config: InfoConfig): boolean {
        return !!config.skippable
    }

    hasBeenDismissed(type: InfoType, state: OnBoardingState) {
        let stat = state[type]
        return stat && stat.dismissedAt
    }

    hasBeenSeenLongEnough(config: InfoConfig, state: OnBoardingState) {
        let lastStat = state[config.type]
        return lastStat && (lastStat.displayedAt + (config.maxDisplay || 0) < Date.now())
    }

    hasBeenDisplayed(type: InfoType, state: OnBoardingState) {
        let stat = state[type]
        return stat && stat.displayedAt
    }

    //based on visibility rules
    shouldBeDisplayed(type: InfoType, state: OnBoardingState, previous: Array<InfoConfig>) {
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


    shouldTipBeDisplayed(type: InfoType, state: OnBoardingState, previous: Array<InfoConfig>) {

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

    //logic which decide if a info is interesting for this user x device configuration
    _displayableByRule = (info: InfoConfig) => {
        switch (info.type) {
            case "focus_add":
                // no conditions on user
                return true
            case "notification_permissions":
                if (!__WITH_NOTIFICATIONS__) return false
                return !NotificationManager.hasPermissionsSync(true)
            case "popular":
                const user = currentUser(false)
                let sCount = _.get(user, 'meta.savingsCount', -1);
                return sCount === 0
            case "noise":
            case "visibility":
            case "private":
                return true
            default:
                return false
        }
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

    createReducer(): any;

    onDisplayed(step: InfoType): void;

    onDismissed(step: InfoType): void;

    shouldDisplayFocusAdd(): boolean;

}



module.exports = new _OnBoardingManager();
