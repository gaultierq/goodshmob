// @flow

import RNFirebase from 'react-native-firebase'
import {Navigation} from 'react-native-navigation';
import NavManager from "./NavManager";
import {isLogged} from "./CurrentUser";


let handleNotif = function (notif) {
    if (!__WITH_NOTIFICATIONS__) return;
    console.log("app opened from notification:" + JSON.stringify(notif));
    if (!notif) return;

    let deeplink = notif.deeplink;
    //test
    NavManager.goToDeeplink(deeplink);
};

export function requestPermissionsForLoggedUser() {
    if (!__WITH_NOTIFICATIONS__) return;
    if (isLogged()) {
        RNFirebase.app().messaging().requestPermissions();
    }

}

export function load() {
    if (!__WITH_NOTIFICATIONS__) return;
    console.info("fcm:load");
    let firebase = RNFirebase.app();

    let messaging = firebase.messaging();

    messaging.getToken().then((token)=>{
        console.info("fcm:token="+token);
    }, (err) => console.log(err));

    messaging.onMessage((message)=>console.log("message received from fcm: "+ JSON.stringify(message)));

    messaging.getInitialNotification().then((notif) => {
        handleNotif(notif);
    });

    // messaging.requestPermissions();

    //test
    // setTimeout(()=> {
    //     console.debug("notification test");
    //     handleNotif({deeplink: "http://goodshit.io/lists/37e67b05-c86c-4aeb-b3af-bf1c34862cd0"});
    // }, 2000);
}

