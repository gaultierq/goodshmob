// @flow

import RNFirebase from 'react-native-firebase'
import type {Device} from "./types";
;
import * as appActions from "./auth/actions";
import * as DeviceInfo from 'react-native-device-info'
//import {toUppercase} from "./utils/StringUtils";
import * as StringUtils from "./utils/StringUtils"


let instance: DeviceManager;

class DeviceManager {

    store: any;

    //waiting for user login to save the device
    init(store): DeviceManager {
        this.store = store;

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
                let diff = flatDiff(oldDevice, newDevice);

                console.info(`device manager: found differences in device. diff=${JSON.stringify(diff)}`);
                console.info(`oldDevice=${JSON.stringify(oldDevice)}`);
                console.info(`newDevice=${JSON.stringify(newDevice)}`);

                let diffKeys = _.keys(diff);
                let realDiff = !arrayContainsArray(['currentDeviceId', 'uniqueId', 'isEmulator','isTablet'], diffKeys);

                if (realDiff) {


                    this.store.dispatch(appActions.saveDevice(newDevice))
                        .then(()=>console.info("new device saved"), err=>console.warn(err));
                }
                else {
                    console.log("device are the same 1")
                }
            }
            else {
                console.log("device are the same 0")
            }
        })

    }
}

function arrayContainsArray(superset, subset) {
    return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
    });
}


function flatDiff(left, right) {

    let allKeys = _.union(_.keys(left), _.keys(right));

    return _.transform(allKeys, (diff, key) => {
        let leftValue = left[key];
        let rightValue = right[key];

        if (leftValue !== rightValue) {
            diff[key] = {leftValue, rightValue}
        }
    }, {});
}

export function init(store) {
    return (instance = new DeviceManager().init(store));
}

export function generateCurrentDevice(): Promise<Device> {
    let firebase = RNFirebase.app();
    let messaging = firebase.messaging();

    const result = {};

    let adapt = (fields, prepend, withPrefix = false) => {
        fields.reduce((result, input) => {
            let deviceKey, fxName;

            if (typeof input === 'string') {
                let f = input;
                let toUppercase = StringUtils.toUppercase(f);

                fxName = prepend + toUppercase;
                deviceKey = withPrefix ? prepend + toUppercase : f;
            }
            else if (typeof input === 'object') {
                fxName = input.fxName;
                deviceKey = input.deviceKey;
            }

            // $FlowFixMe
            let fx = DeviceInfo[fxName];
            if (!fx) throw "not found:" + fx;
            try {
                // $FlowFixMe
                result[deviceKey] = fx();
            }
            catch(err) {
                console.warn(err);
            }
            return result;
        }, result);
    };
    adapt([
        {fxName: "getUniqueID", deviceKey: "uniqueId"},"manufacturer","brand","model","deviceId","systemName",
        "systemVersion","bundleId","buildNumber","version","readableVersion",
        "deviceName","userAgent","deviceLocale","deviceCountry","timezone"
    ], "get");
    adapt(["emulator","tablet"], "is", true);

    return messaging.getToken().then(fcmToken=>{
        result.fcmToken = fcmToken;

        //temp, so backend is has the token
        result.token = fcmToken;

        console.info(`device manager: generated device:${JSON.stringify(result)}`);
        return result
    });
}