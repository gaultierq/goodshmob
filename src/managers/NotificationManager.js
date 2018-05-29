// @flow

import {Linking} from 'react-native'
import type {Notification, NotificationOpen} from 'react-native-firebase';
import RNFirebase from 'react-native-firebase'
import {Navigation} from 'react-native-navigation';
import NavManager from "./NavManager";


class _NotificationManager implements NotificationManager {

    configured: boolean = false;
    logger: GLogger

    constructor() {
    }

    init() {
        this.logger = logger.createLogger('notifications')
        if (!__WITH_NOTIFICATIONS__) return;
        this.logger.info("fcm:load");
        this.configureSafe();
    }

    configureSafe() {
        RNFirebase
            .app()
            .messaging()
            .hasPermission()
            .then(enabled => {
                if (enabled) {
                    this.configure();
                }
                else {
                    this.logger.warn("fcm: permission not granted");
                }
            });
    }

    configure() {
        if (this.configured) throw 'already configured'
        this.configured = true

        let firebase = RNFirebase.app()
        let messaging = firebase.messaging();

        messaging.getToken().then((token) => {
            this.logger.info("fcm:token=" + token);
        }, (err) => this.logger.error(err));

        firebase.notifications().getInitialNotification().then((notificationOpen: NotificationOpen) => {
            this.logger.log('getInitialNotification', notificationOpen)
            if (notificationOpen) this.handleNotif(notificationOpen.notification)
        })


        //android: receiving notification when app in foreground
        firebase.notifications().onNotification((notification: Notification) => {
            console.log('onNotification', notification)
            Navigation.showInAppNotification({
                screen: "goodsh.InAppNotif", // unique ID registered with Navigation.registerScreen
                passProps: {
                    title: _.get(notification, '_title'),
                    body: _.get(notification, '_body'),
                    deeplink: _.get(notification, '_data.deeplink')
                }, // simple serializable object that will pass as props to the in-app notification (optional)
                autoDismissTimerSec: 5 // auto dismiss notification in seconds
            })
            //handleNotif(notification)
        });

        firebase.notifications().onNotificationDisplayed((notification: Notification) => {
            this.logger.info('onNotificationDisplayed', notification)
        });

        //android: triggered when app opening from notification
        firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
            this.logger.info('onNotificationOpened', notificationOpen)
            if (notificationOpen) this.handleNotif(notificationOpen.notification)
        });
    }

    requestPermissionsForLoggedUser() {
        return new Promise((resolve,reject) => {
            if (!__WITH_NOTIFICATIONS__) {
                reject('notifications are not enabled on device')
            }
            else {
                this.logger.info('request Permissions For LoggedUser')
                RNFirebase
                    .app()
                    .messaging()
                    .requestPermission()
                    .then( () => {
                        this.logger.info('notification permission granted')
                        this.configure()
                        resolve()
                    }, reject)
            }


        })
    }

    handleNotif = notif => {
        if (!__WITH_NOTIFICATIONS__) return;
        if (!notif) return
        if (!notif._data) {
            console.warn("no data found on notification", notif)
            return
        }
        if (notif._data.deeplink) {
            NavManager.goToDeeplink(notif._data.deeplink);
        }
        else {
            console.warn("no deeplink found on notification", notif)
        }

        // let deeplink = notif.deeplink;
        //test
        // NavManager.goToDeeplink(deeplink);
    };
}

export interface NotificationManager {

    init(store: any): void;

    requestPermissionsForLoggedUser(): Promise<boolean>

}

module.exports = new _NotificationManager();


