// @flow

import RNFirebase from 'react-native-firebase'
import {Navigation} from 'react-native-navigation';
import NavManager from "./NavManager";
import {isLogged} from "./CurrentUser";
import type { Notification, NotificationOpen } from 'react-native-firebase';

let handleNotif = function (notif) {
    if (!__WITH_NOTIFICATIONS__) return;
    console.log("app opened from notification:" + JSON.stringify(notif));
    if (!notif) return;

    // let deeplink = notif.deeplink;
    //test
    // NavManager.goToDeeplink(deeplink);
};

export async function requestPermissionsForLoggedUser() {
    if (!__WITH_NOTIFICATIONS__) return;
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

    messaging.onMessage((message)=>console.log("message received from fcm: "+ JSON.stringify(message)));


    firebase.notifications().getInitialNotification().then((notificationOpen: NotificationOpen)=> {
        console.log('getInitialNotification', notificationOpen)
    })
    

    //android: receiving notification when app in foreground
    firebase.notifications().onNotification((notification: Notification) => {
        console.log('onNotification', notification)
    });

    firebase.notifications().onNotificationDisplayed((notification: Notification) => {
        console.log('onNotificationDisplayed', notification)
    });

    //android: triggered when app opening from notification
    firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
        // // Get the action triggered by the notification being opened
        // const action = notificationOpen.action;
        // // Get information about the notification that was opened
        // const notification: Notification = notificationOpen.notification;
        console.log('onNotificationOpened', notificationOpen)
    });


    // messaging.requestPermissions();

    //test
    // setTimeout(()=> {
    //     console.debug("notification test");
    //     handleNotif({deeplink: "http://goodshit.io/lists/37e67b05-c86c-4aeb-b3af-bf1c34862cd0"});
    // }, 2000);
}

