// @flow

import {Linking} from 'react-native'
import type {Notification, NotificationOpen} from 'react-native-firebase'
import RNFirebase from 'react-native-firebase'
import {Navigation} from 'react-native-navigation'
import NavManager from "./NavManager"
import {listenToLoginChange, LoginChangeOptions} from "./ManagerUtils"
import type {Id} from "../types"

const logger = rootlogger.createLogger('notifications')

class _NotificationManager implements NotificationManager {

    configured: boolean = false;
    logger: GLogger

    _hasPermission: boolean //used as a proxy for synchronous cases

    constructor() {
    }

    async init(currentUserId: ?Id) {
        if (!__WITH_NOTIFICATIONS__) return;
        logger.info("fcm:load");
        this.configureSafe()
        this._hasPermission = await this.hasPermissions()

        const options: LoginChangeOptions = {
            onUser: () => {},
            onNoUser: () => {},
            triggerOnListen: {payload: currentUserId},
        }
        listenToLoginChange(options)
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
                    logger.warn("fcm: permission not granted");
                }
            });
    }

    async hasPermissions(): Promise<boolean> {
        return RNFirebase
            .app()
            .messaging()
            .hasPermission()
    }

    hasPermissionsSync(askAgain: boolean = false): boolean {
        if (askAgain) {
            setTimeout(()=> {
                this.hasPermissions().then(has=>this._hasPermission = has)
            })
        }
        return this._hasPermission
    }

    async getInitialNotificationLink() {
        if (!__WITH_NOTIFICATIONS__) return null

        // get the notification that opened the app
        let notificationOpen: NotificationOpen = await RNFirebase.app().notifications().getInitialNotification()
        const deeplink = _.get(notificationOpen, 'notification._data.deeplink')
        if (notificationOpen) {
            logger.info("app opened from notification with deeplink:", deeplink, notificationOpen);
        }
        return deeplink
    }

    configure() {
        if (this.configured) return
        this.configured = true

        let firebase = RNFirebase.app()
        // let messaging = firebase.messaging();

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
            logger.info('on notification nisplayed', notification)
        });

        //android: triggered when app opening from notification
        firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
            logger.info('onNotificationOpened', notificationOpen)
            if (notificationOpen) this.handleNotif(notificationOpen.notification)
        });
    }

    async requestPermissionsForLoggedUser(): Promise<void> {
        if (!__WITH_NOTIFICATIONS__) Promise.reject('with_notifications = true')

        logger.info('requesting permissions for logged user')
        await RNFirebase.app().messaging().requestPermission()
        logger.info('notification permission granted')

        this.configure()
    }

    handleNotif = (notif: any) => {
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

    init(store: any): Promise<void>;

    requestPermissionsForLoggedUser(): Promise<boolean>;

    hasPermissionsSync(askAgain?: boolean): boolean;

    getInitialNotificationLink(): string

}

module.exports = new _NotificationManager();


