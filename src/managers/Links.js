// @flow

import Config from "react-native-config"
import type {Id, Lineup, User} from "../types"
import {Linking} from "react-native"
import URL from "url-parse"


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

let buildLineupUrl = function (lineup, passProps, protocol) {
    let name = _.get(lineup, 'name')
    let pp = name && {lineupName: name}
    passProps = passProps ? _.assign(passProps, pp) : pp
    return `${protocol}lists/${lineup.id}${passPropsString(passProps)}`
}

export function buildLineupUrlInternal(lineup: Lineup, passProps?: any): string {
    return buildLineupUrl(lineup, passProps, `${Config.GOODSH_PROTOCOL_SCHEME}://it/`)
}
export function buildLineupUrlExternal(lineup: Lineup, passProps?: any): string {
    return buildLineupUrl(lineup, passProps, Config.SERVER_URL)
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

export function decorateUrlWithLongPress(url: string): URL {
    let result: URL
    try {
        result = new URL(url)
        const q = result.query
        result.set('query', {... (q || {}), origin: 'long_press'})
    }
    catch (e) {
        console.log("failed to parse result", e)
    }

    return result
}

export function pressToSeeUserSheet(user: User) {
    return () => openLinkSafely(decorateUrlWithLongPress(buildUserUrl(user)).toString())
}

export function pressToSeeLineup(lineup: Lineup) {
    return () => openLinkSafely(buildLineupUrlInternal(lineup))
}
