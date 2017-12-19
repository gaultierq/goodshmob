// @flow
import EventBus from 'eventbusjs'
import {EVENT_MESSAGE} from "./events";
import type {Message} from "./events";
import Snackbar from "react-native-snackbar"

class Messenger {
    id = Math.random();

    constructor() {
        EventBus.addEventListener(EVENT_MESSAGE, this.onMessage.bind(this));
    }

    onMessage(event: any, message: Message) {
        console.debug("Messenger: on message");

        const {content, type, ...others} = message;
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

module.exports = new Messenger();
