// @flow

import dotprop from "dot-prop-immutable"
import {Call} from "./Api"
import Stream from 'getstream'
import Config from 'react-native-config'
import {currentUserId} from "./CurrentUser"

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

    async obtainUserSessionToken() {
        let token = _.get(this.store.getState(), `stream.user_session_token`)
        if (!token) {
            const response = await new Call()
                .withMethod('GET')
                .withRoute("stream/generate_token")
                .submit()

            if (response.ok) {
                token = await response.text()
                this.store.dispatch({type: SET_STREAM_TOKEN, token})
            }

        }
        return token
    }

    async userSession() {
        let token = await this.obtainUserSessionToken()
        if (token) return this.client.createUserSession(token)
        return null
    }

    //return the number of new activity groups
    async networkNewActivityCount() {
        let userId = currentUserId()
        if (!userId) return -1
        let lastFetchedAGid = _.get(this.store.getState(), `network.${userId}.list[0].id`)
        if (!lastFetchedAGid) return -1
        let session = await this.userSession()
        if (!session) return -1
        let feed = await session.feed('timeline_aggregated').get({limit: 10})
        let res = _.get(feed, 'results')
        return _.findIndex(res, r => r.id === lastFetchedAGid)
    }

}

export const SET_STREAM_TOKEN = "SET_STREAM_TOKEN"
export type SET_STREAM_TOKEN_ACTION = {
    type: string,
    token: ?string
}

export function reducer() {
    return (state: any = {}, action: SET_STREAM_TOKEN_ACTION) => {

        switch (action.type) {
            case SET_STREAM_TOKEN:
                return dotprop.set(state, `tokens.user_session_token`, action.token);
        }

        return state
    }
}

let instance: StreamManager = new StreamManager()
export default instance

