// @flow

import RNFirebase from 'react-native-firebase'
import type {Device} from "./types";
import * as _ from "lodash";
import * as appActions from "./auth/actions";

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
                console.info("device manager: found differences in device. saving");
                this.store.dispatch(appActions.saveDevice(newDevice)).then(()=>console.info("new device saved"), err=>console(err));
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

    return messaging.getToken().then(fcmToken=>{return {fcmToken}});
}