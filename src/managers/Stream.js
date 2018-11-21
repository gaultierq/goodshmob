// @flow

import dotprop from "dot-prop-immutable"
import {Call} from "./Api"
import Stream from 'getstream'
import Config from 'react-native-config'

const logger = rootlogger.createLogger("stream")

class StreamManager {

    store: any
    client: any

    init(store): StreamManager {
        logger.info('init')
        this.store = store
        //apiKey, apiSecret, appId, options
        this.client = Stream.connect(Config.GET_STREAM_KEY, null)
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

    async userSession(feedName: string) {
        let token = await this.obtainFeedToken(feedName)
        if (token) return this.client.createUserSession(token)
        return null
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

