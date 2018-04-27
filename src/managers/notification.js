// @flow

import {Linking} from 'react-native'
import RNFirebase from 'react-native-firebase'
import {Navigation} from 'react-native-navigation';
import NavManager from "./NavManager";
import {isLogged} from "./CurrentUser";
import type { Notification, NotificationOpen } from 'react-native-firebase';


let handleNotif = function (notif) {
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

export async function requestPermissionsForLoggedUser() {
    if (!__WITH_NOTIFICATIONS__) return;
    console.info('requestPermissionsForLoggedUser')
    if (isLogged()) {
        RNFirebase.app().messaging().requestPermission();
    }
}

export async function load() {
    if (!__WITH_NOTIFICATIONS__) return;
    let firebase = RNFirebase.app();
    const enabled = await firebase.messaging().hasPermission();

    if (!enabled) {
        console.info("fcm: permission not granted");
        return
    }
    console.info("fcm:load");


    let messaging = firebase.messaging();

    messaging.getToken().then((token)=>{
        console.info("fcm:token="+token);
    }, (err) => console.log(err));

    firebase.notifications().getInitialNotification().then((notificationOpen: NotificationOpen)=> {
        console.log('getInitialNotification', notificationOpen)
        if (notificationOpen) handleNotif(notificationOpen.notification)
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
            autoDismissTimerSec: 3 // auto dismiss notification in seconds
        })
        //handleNotif(notification)
    });

    firebase.notifications().onNotificationDisplayed((notification: Notification) => {
        console.log('onNotificationDisplayed', notification)
    });

    //android: triggered when app opening from notification
    firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
        console.log('onNotificationOpened', notificationOpen)
        if (notificationOpen) handleNotif(notificationOpen.notification)
    });


    // messaging.requestPermissions();

    //test
    // setTimeout(()=> {
    //     console.debug("notification test");
    //     handleNotif({deeplink: "http://goodshit.io/lists/37e67b05-c86c-4aeb-b3af-bf1c34862cd0"});
    // }, 2000);
}


let onNotificationOpenedExample = { action: 'android.intent.action.VIEW',
    notification:
        {
            _android:
                { _notification: '[Circular]',
                    _actions: [],
                    _people: [],
                    _smallIcon: { icon: 'ic_launcher' }
                },
            _ios: { _notification: '[Circular]', _attachments: [] },
            _body: undefined,
            _data:
                { comment_content: 'Weess',
                    deeplink: 'https://goodshitapp-staging.herokuapp.com/savings/7af4395f-048d-49a5-8b74-26c6b377c8fc/comments',
                    sender_full_name: 'Benoit Taconet',
                    item_title: 'Règlement de comptes à O.K. Corral [Blu-ray]'
                },
            _notificationId: '0:1524059133511218%54aee52c54aee52c',
            _sound: undefined,
            _subtitle: undefined,
            _title: undefined
        },
    results: undefined
};

