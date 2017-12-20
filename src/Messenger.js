// @flow
import EventBus from 'eventbusjs'
import {EVENT_MESSAGE} from "./events";
import Snackbar from "react-native-snackbar"

class _Messenger implements Messenger {
    id = Math.random();

    constructor() {
    }

    init() {
        EventBus.addEventListener(EVENT_MESSAGE, this.onMessage.bind(this));
    }

    onMessage(event: any) {
        console.debug("Messenger: on message");

        const {content, type, ...others} = event.target;
        switch (type) {
            case 'snack':
                Snackbar.show({title: content});
                break;
            default:
                throw `unsupported message type: ${type}`
        }
    }

    toString() {
        return "Messenger-" + this.id;
    }
}
export interface Messenger {

    init(): void;
}

module.exports = new _Messenger();
