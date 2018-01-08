// @flow
import EventBus from 'eventbusjs'
import {EVENT_MESSAGE} from "../events";
import Snackbar from "react-native-snackbar"

class _Messenger implements Messenger {
    id = Math.random();
    snackDismissTimeout: number;

    constructor() {
    }

    init() {
        EventBus.addEventListener(EVENT_MESSAGE, this.onMessage.bind(this));
    }

    onMessage(event: any) {
        console.info(`${this.toString()}: on message: ${JSON.stringify(event)}`);

        const {content, type, ...others} = event.target;
        switch (type) {
            case 'snack':
                //TODO: something with priority
                let {priority, reference} = others;

                if (!this.snackDismissTimeout) {
                    this.snackDismissTimeout = setTimeout(()=> {
                        this.snackDismissTimeout = 0;
                        console.debug(`${this.toString()}: dismissing snack`);
                        Snackbar.dismiss();
                    }, 2000);

                    Snackbar.show({
                        title: content,
                        duration: Snackbar.LENGTH_INDEFINITE,
                    });


                }

                break;
            default:
                throw `unsupported message type: ${type}`
        }
    }

    toString() {
        return "Messenger-" + this.id;
    }
}
interface Messenger {

    init(): void;
}

function sendMessage(message: string, options?: any) {
    EventBus.dispatch(EVENT_MESSAGE, {content: message, type: 'snack', ...options});
}

module.exports = {
    Messenger: new _Messenger(),
    sendMessage
};