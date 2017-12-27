// @flow
import {Navigation} from 'react-native-navigation';
import type {Deeplink} from "../types";
import {isId} from "../helpers/StringUtils";
import {isActivityType} from "../helpers/DataUtils";
import * as Nav from "../ui/Nav";

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
        //                 console.info('deeplink received:' + JSON.stringify(event));
        //                 this.goToDeeplink(payload.target);
        //                 break;
        //         }
        //     }
        // })
    }


    toString() {
        return "Messenger-" + this.id;
    }

    goToDeeplink(deeplink: Deeplink) {
        console.info('goToDeeplink: ' + deeplink);
        if (!deeplink) return false;

        let url = new URL(deeplink);
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

            this.showModal({
                screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: id,
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
            navigatorButtons: {
                leftButtons: [
                    {
                        id: Nav.CLOSE_MODAL,
                        title: "#Cancel"
                    }
                ],
            },
            ...modal,
        })
    }


}

export interface NavManager {

    init(): void;

    goToDeeplink(url: Deeplink): boolean;
}

module.exports = new _NavManager();
