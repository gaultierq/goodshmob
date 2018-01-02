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
        console.debug(`${this.toString()}: on message: ${event}`);

        const {content, type, ...others} = event.target;
        switch (type) {
            case 'snack':
                //TODO: something with priority
                let {priority} = others;

                if (!this.snackDismissTimeout) {
                    this.snackDismissTimeout = setTimeout(()=> {
                        this.snackDismissTimeout = 0;
                        console.info(`${this.toString()}: dismissing snack`);
                        Snackbar.dismiss();
                    }, 2000);

                    console.info('Messenger: showing snack');
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
export interface Messenger {

    init(): void;
}

module.exports = new _Messenger();
