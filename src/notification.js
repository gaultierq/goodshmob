// @flow

import RNFirebase from 'react-native-firebase'
import type {Deeplink} from "./types";
import URL from "url-parse"
import * as _ from "lodash";
import {Navigation} from 'react-native-navigation';

let handleNotif = function (notif) {
    if (!notif) return;

    console.log("app opened from notification:" + JSON.stringify(notif));

    let deeplink = notif.deeplink;
    //test
    resolveDeeplink(deeplink);
};

export function load() {
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

    //test
    // setTimeout(()=> {
    //     console.debug("notification test");
    //     handleNotif({deeplink: "http://goodshit.io/lists/37e67b05-c86c-4aeb-b3af-bf1c34862cd0"});
    // }, 2000);
}

function resolveDeeplink(deeplink: Deeplink) {
    if (!deeplink) return false;

    let url = new URL(deeplink);
    //gds://goodsh.io/lineup/15
    let pathname = url.pathname;
    if (!pathname) return false;
    let parts = pathname.split('/');
    //let main = parts[0];
    let main = _.nth(parts, 1);

    if (main === 'lists') {
        let id = _.nth(parts, 2);
        if (isId(id)) {
            Navigation.showModal({
                screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: id,
                },
            });
            return true;
        }
    }

}

function isId(id: string) {
    return /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/g.test(id)

}

function isHex(hex: string) {
    if (typeof hex !== 'string') return false;


}