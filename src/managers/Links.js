// @flow

import Config from "react-native-config"
import type {Id, Lineup, User} from "../types"
import {Linking} from "react-native"


let passPropsString = (passProps, sep = "?") => _.isEmpty(passProps) ? "" : `${sep}passProps=${encodeURIComponent(JSON.stringify(passProps))}`

export function createOpenModalLink(screen:string , title: ?string, passProps?: any) {
    let result = `${Config.GOODSH_PROTOCOL_SCHEME}://it/openmodal?screen=${screen}`
    if (title) {
        result = result + `&title=${encodeURIComponent(title)}`
    }
    if (passProps) {
        result = result + passPropsString(passProps, "&")
    }
    return result
}

export function buildUserUrl(user: User): string {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/users/${user.id}${passPropsString(_.pick(user, ['firstName', 'lastName']))}`
}

export function buildLineupUrl(lineup: Lineup): string {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/lists/${lineup.id}`
}

export function buildSearchItemUrl(defaultLineupId?: Id) {
    return createOpenModalLink('goodsh.SearchItems', i18n.t('search_item_screen.title'), {defaultLineupId})
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

export function pressToSeeUser(user: User) {
    return () => openLinkSafely(buildUserUrl(user))
}
