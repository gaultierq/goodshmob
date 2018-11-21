// @flow

import dotprop from "dot-prop-immutable"
import {Call} from "./Api"



const logger = rootlogger.createLogger("stream")

class StreamManager {

    store: any;

    init(store): StreamManager {
        logger.info('init')
        this.store = store;
        return this;
    }

    async obtainFeedToken(feedName: string) {
        let tok = _.get(this.store.getState(), `stream.tokens.${feedName}`)
        if (!tok) {
            const response = await new Call()
                .withMethod('GET')
                .withRoute("stream/generate_token")
                .addQuery({feed_name: feedName}).submit()

            if (response.ok) {
                let token = await response.text()
                this.store.dispatch({type: SET_STREAM_TOKEN, feedName, token})
                tok = token
            }

        }
        return tok
    }
}

export const SET_STREAM_TOKEN = "SET_STREAM_TOKEN"
export type SET_STREAM_TOKEN_ACTION = {
    type: string,
    feedName: string,
    token: ?string
}

export function reducer() {
    return (state: any = {}, action: SET_STREAM_TOKEN_ACTION) => {

        switch (action.type) {
            case SET_STREAM_TOKEN:
                return dotprop.set(state, `tokens.${action.feedName}`, action.token);
        }

        return state
    }
}

let instance: StreamManager = new StreamManager()
export default instance

