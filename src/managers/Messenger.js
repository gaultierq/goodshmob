// @flow
import EventBus from 'eventbusjs'
import {EVENT_MESSAGE} from "../events"
import Snackbar from "react-native-snackbar"
import {Colors} from "../ui/colors"

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
                let {priority, reference, action, timeout = 2000, dangerous} = others;
                action = action && {...action, color: Colors.white};


                if (this.snackDismissTimeout) clearTimeout(this.snackDismissTimeout);

                this.snackDismissTimeout = setTimeout(()=> {
                    this.snackDismissTimeout = 0;
                    console.debug(`${this.toString()}: dismissing snack`);
                    Snackbar.dismiss();
                }, timeout);

                Snackbar.show({
                    title: content,
                    action,
                    duration: Snackbar.LENGTH_INDEFINITE,
                    backgroundColor:dangerous ? Colors.orange : Colors.blue,
                });
                // }
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
