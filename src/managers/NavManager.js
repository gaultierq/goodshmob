// @flow
import {Navigation} from 'react-native-navigation';
import type {Activity, Deeplink} from "../types";
import {isId} from "../helpers/StringUtils";
import {isActivityType, sanitizeActivityType} from "../helpers/DataUtils";
import * as Nav from "../ui/Nav";
import URL from "url-parse"
import Config from 'react-native-config';
import {displayLineupActionMenu} from "../ui/Nav";
import {getLineup} from "../helpers/DataAccessors";

// export const DEEPLINK_OPEN_SCREEN_IN_MODAL = 'DEEPLINK_OPEN_SCREEN_IN_MODAL';

class _NavManager implements NavManager {
    id = Math.random();

    constructor() {
    }

    init() {
        // Navigation.setEventHandler('myUniqueIdHere', (event) => {
        //     if (event.type === 'DeepLink') {
        //         const payload = event.payload; // (optional) The payload
        //
        //         switch (event.link) {
        //             case DEEPLINK_OPEN_SCREEN_IN_MODAL:
        //                 console.info('deeplink received:' , event);
        //                 this.goToDeeplink(payload.target);
        //                 break;
        //         }
        //     }
        // })
    }


    toString() {
        return "Messenger-" + this.id;
    }

    //options is a quick fix
    goToDeeplink(deeplink: Deeplink, options?: any) {
        console.info('goToDeeplink: ' + deeplink);
        if (!deeplink) return false;

        let url = new URL(deeplink, "", true);
        //gds://goodsh.io/lineup/15
        let pathname = url.pathname;
        if (!pathname) return false;
        let parts = pathname.split('/');
        //let main = parts[0];
        let main = _.nth(parts, 1);


        let modal;
        if (main === 'lists') {
            let id = _.nth(parts, 2);
            if (!isId(id)) return false;

            if (url.query && url.query.origin === 'long_press') {
                if (options) {
                    let {dispatch, navigator} = options
                    getLineup(id).then(lineup => displayLineupActionMenu(navigator, dispatch, lineup))
                }
                return
            }
            this.showModal({
                screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: id,
                },
            });
            return true;
        }
        if (main === 'users') {
            let id = _.nth(parts, 2);
            if (!isId(id)) return false;

            if (url.query && url.query.origin === 'long_press') {
                this.showModal({
                    screen: 'goodsh.UserSheet', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        userId: id,
                    },
                });
                return
            }

            this.showModal({
                screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    userId: id,
                },
            });
            return true;
        }
        if (isActivityType(main)) {
            let activityType = main;
            let id = _.nth(parts, 2);
            if (!isId(id)) return false;
            let _3rd = _.nth(parts, 3);
            if (_3rd === 'comments') {
                this.showModal({
                    screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        activityId: id,
                        activityType: activityType
                    },
                });
                return true;
            }
            this.showModal({
                screen: 'goodsh.ActivityDetailScreen',
                passProps: {activityId: id, activityType}
            });

        }
    }

    showModal(modal: any) {
        Navigation.showModal({
            ...modal,
            navigatorButtons: Nav.CANCELABLE_MODAL,
        })
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

    localDeeplink(activity: activity): Deeplink;
}

module.exports = new _NavManager();
