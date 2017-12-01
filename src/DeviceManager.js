// @flow

import RNFirebase from 'react-native-firebase'
import type {Device} from "./types";
;
import * as appActions from "./auth/actions";
import * as DeviceInfo from 'react-native-device-info'
//import {toUppercase} from "./utils/StringUtils";
import * as StringUtils from "./utils/StringUtils"


let instance: DeviceManager;

/*

 */
class DeviceManager {

    store: any;
    device;

    //waiting for user login to save the device
    init(store): DeviceManager {
        this.store = store;
        let {auth} = store.getState();

        //init with logged user => check & send diff
        if (store.getState().auth.currentUserId) {
            this.checkAndSendDiff();
        }
        else {
            console.debug("device manager: subscribing");
            let unsubscribe = this.store.subscribe(() => {
                if (store.getState().auth.currentUserId) {
                    unsubscribe();
                    this.checkAndSendDiff();
                }
            });
        }
        return this;
    }

    checkAndSendDiff() {
        console.debug("device manager: checkAndSendDiff");
        let oldDevice: Device= {...this.store.getState().device};
        generateCurrentDevice().then(newDevice => {
            if (!_.isEqual(oldDevice, newDevice)) {
                console.info(`device manager: found
                 differences in device. 
                 oldDevice=${JSON.stringify(oldDevice)}
                 !=
                 newDevice=${JSON.stringify(newDevice)}`);

                this.store.dispatch(appActions.saveDevice(newDevice))
                    .then(()=>console.info("new device saved"), err=>console.warn(err));
            }
        })

    }

}
export function init(store) {
    return (instance = new DeviceManager().init(store));
}

export function generateCurrentDevice(): Promise<Device> {
    let firebase = RNFirebase.app();
    let messaging = firebase.messaging();

    const result = {};

    let adapt = (fields, prepend) => {
        fields.reduce((result, f) => {
            let toUppercase = StringUtils.toUppercase(f);
            let fx = DeviceInfo[prepend + toUppercase];
            if (!fx) throw "not found:" + fx;
            try {
                result[f] = fx();
            }
            catch(err) {
                console.warn(err);
            }
            return result;
        }, result);
    };
    adapt([
        "uniqueID","manufacturer","brand","model","deviceId","systemName",
        "systemVersion","bundleId","buildNumber","version","readableVersion",
        "deviceName","userAgent","deviceLocale","deviceCountry","timezone"
    ], "get");
    adapt(["emulator","tablet"], "is");

    return messaging.getToken().then(fcmToken=>{
        result.fcmToken = fcmToken;

        //temp, so backend is has the token
        result.token = fcmToken;

        console.info(`device manager: generated device:${JSON.stringify(result)}`);
        return result
    });
}