// @flow
import {Navigation} from 'react-native-navigation'
import type {Activity, Deeplink} from "../types"
import {isId} from "../helpers/StringUtils"
import {isActivityType, sanitizeActivityType} from "../helpers/DataUtils"
import * as Nav from "../ui/Nav"
import {CANCELABLE_MODAL, displayLineupActionMenu} from "../ui/Nav"
import URL from "url-parse"
import Config from 'react-native-config'
import {getLineup} from "../helpers/DataAccessors"
import {SearchItemCategoryType, SEARCH_CATEGORIES_TYPE} from "../helpers/SearchConstants"
import {getTabIndex} from "../app"

// export const DEEPLINK_OPEN_SCREEN_IN_MODAL = 'DEEPLINK_OPEN_SCREEN_IN_MODAL';

type RNNModal = any
type RNNTab = {
    screen: string,

}

class _NavManager implements NavManager {
    id = Math.random();

    constructor() {
    }

    init() {
    }


    toString() {
        return "NavManager-" + this.id;
    }

    //options is a quick fix ?
    //return true if handled
    goToDeeplink(deeplink: Deeplink, options?: any) {


        const result = this.parseDeeplink(deeplink, options)

        console.debug('go to link: ', deeplink, result);

        let {modal, handler, tab} = result


        if (modal) {
            Navigation.showModal({
                ...modal,
                navigatorButtons: Nav.CANCELABLE_MODAL,
            })
            return true
        }
        else if (tab) {
            Navigation.handleDeepLink({
                link: 'topLevelIndex',
                payload: getTabIndex(tab)
            })
            return true
        }
        else if (handler) {
            //TODO: remove
            handler()
            return true
        }
        return false
    }

    parseDeeplink(deeplink: ?string, options?: any) {


        if (!deeplink) return {}

        let url = new URL(deeplink, "", true)
        //gds://goodsh.io/lineup/15
        let pathname = url.pathname || ''
        let parts = pathname.split('/')

        let main = _.nth(parts, 1)


        let modal: RNNModal
        let handler: any
        let tab: any


        //after RNN v2, try to see if there is a static "switchToTab"
        if (main === 'explore' || main === 'discover') {
            let itemType = _.nth(parts, 2)
            tab = {
                screen: 'goodsh.CategorySearchScreen',
            }

            if (itemType) {
                const initialIndex = Math.max(SEARCH_CATEGORIES_TYPE.indexOf(itemType), 0)
                tab = {
                    ...tab,
                    passProps: {
                        initialIndex,
                        searchOptions: {
                            [itemType]: url.query
                        }
                    }
                }
            }


        }
        if (main === 'lists') {
            let id = _.nth(parts, 2)
            if (!isId(id)) {}
            else if (url.query && url.query.origin === 'long_press') {
                if (options) {
                    let {dispatch, navigator} = options
                    handler = () => getLineup(id).then(lineup => displayLineupActionMenu(navigator, dispatch, lineup))
                }
            }
            else {
                modal = {
                    screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        lineupId: id,
                    },
                }

            }
        }
        if (main === 'users') {
            let id = _.nth(parts, 2)

            if (!isId(id)) {
            }
            else if (url.query && url.query.origin === 'long_press') {
                modal = {
                    screen: 'goodsh.UserSheet', // unique ID registered with Navigation.registerScreen
                    animationType: 'none',
                    passProps: {
                        userId: id,
                    },
                }
            }
            else {
                modal = {
                    screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        userId: id,
                    },
                }
            }
        }
        if (isActivityType(main)) {
            let activityType = main
            let id = _.nth(parts, 2)
            let _3rd = _.nth(parts, 3)
            if (!isId(id)) {
            }
            else if (_3rd === 'comments') {

                modal = {
                    screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        activityId: id,
                        activityType: activityType
                    },
                }
            }
            else if (activityType === 'asks') {
                modal = {
                    screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
                    // title: fullName(user),
                    passProps: {
                        activityId: id,
                        activityType: activityType,
                        autoFocus: true
                    },
                    navigatorButtons: CANCELABLE_MODAL
                }
            }
            else {
                modal = {
                    screen: 'goodsh.ActivityDetailScreen',
                    passProps: {activityId: id, activityType}
                }
            }
        }
        return {modal, handler, tab}
    }

//temporary: should be provided by the backend
    localDeeplink(activity: Activity): Deeplink {
        const activityType = sanitizeActivityType(activity.type);
        if (!activityType) return null;
        let resource = activity.resource;

        switch (activityType) {
            case 'comments': {
                if (resource) {
                    let {id, type} = resource;
                    return `${Config.SERVER_URL}${sanitizeActivityType(type)}/${id}/comments`
                }
                break;
            }
            default:
                if (resource) {
                    let {id, type} = resource;
                    return `${Config.SERVER_URL}${sanitizeActivityType(type)}/${id}`
                }
        }
    }


}

export interface NavManager {

    init(): void;

    goToDeeplink(url: Deeplink): boolean;

    localDeeplink(activity: Activity): Deeplink;

    parseDeeplink(url: Deeplink): {modal?: RNNModal, handler?: any, tab?: RNNTab}
}

module.exports = new _NavManager();
