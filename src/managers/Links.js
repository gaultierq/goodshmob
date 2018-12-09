// @flow

import Config from "react-native-config"
import type {Lineup, User} from "../types"
import {Linking} from "react-native"


export function createOpenModalLink(screen:string , title: ?string, passProps?: any) {
    let result = `${Config.GOODSH_PROTOCOL_SCHEME}://it/openmodal?screen=${screen}`
    if (title) {
        result = result + `&title=${encodeURIComponent(title)}`
    }
    if (passProps) {
        result = result + "&passProps=" + encodeURIComponent(JSON.stringify(passProps))
    }
    return result
}

export function buildUserUrl(user: User): string {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/users/${user.id}`
}

export function buildLineupUrl(lineup: Lineup): string {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/lists/${lineup.id}`
}

export function openLinkSafely(url: ?string) {
    console.log("openLinkSafely", url)
    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url)
        } else {
            console.log("Don't know how to open URI: ", url)
        }
    })
}
