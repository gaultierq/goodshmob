import type {Activity, Lineup, NavParams, User} from "../types"
import {fullName, savingCount} from "../helpers/StringUtils"
import HTMLView from "react-native-htmlview/HTMLView"
import React from "react"
import Config from "react-native-config"
import {isAsking, isSaving, isSending} from "../helpers/DataUtils"
import {StyleSheet} from "react-native"
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "./fonts"
import {Colors} from "./colors"
import NavManager from "../managers/NavManager"
import URL from "url-parse"


export function getActivityText(activity: Activity, navP: NavParams): () => any {
    if (isSaving(activity)) return _renderSavedInList(activity, navP)
    else if (isSending(activity)) return _renderSendTo(activity)
    else if (isAsking(activity)) return renderAsk(activity)
    else if (isComment(activity)) return renderAsk(activity)
    else throw "christ:" + activity.type
}

export function getMainUrl(activity: Activity): ?string {
    if (isSaving(activity)) return buildLineupUrl(activity.target)
    else if (isSending(activity)) return buildUserUrl(activity.target)
    else if (isAsking(activity)) return null
    else throw "christ:" + activity.type
}

function _renderSavedInList(activity: Activity, navP: NavParams) {
    let target = activity.target

    const user = activity.user
    let textNode = (
        <HTMLView
            // renderNode={renderNode}
            onLinkLongPress={pressed => {
                showResourceActions(pressed, navP)
            }
            }
            value={`<div>${i18n.t("activity_item.header.in",
                {
                    adder: getUserHtml(user),
                    lineup: getLineupHtml(target),
                    what: getItemHtml(activity)
                }
            )}</div>`}
            stylesheet={htmlStyles}
        />
    )

    return {
        textNode,
        content: activity.description
    }
}

export function showResourceActions(pressed: string, navP: NavParams) {
    let url = decorateUrlWithLongPress(pressed)
    if (url) {
        NavManager.goToDeeplink(url, navP)
    }
}

function decorateUrlWithLongPress(url: string): URL {
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

function getItemHtml(activity: Activity) {
    return `<i>${truncate(activity.resource.title)}</i>`
}

function truncate(string: string) {
    return _.truncate(string, {
        'length': 40,
        'separator': /,? +/
    })
}

function _renderSendTo(activity) {
    let target = activity.target
    const user = activity.user
    let textNode = <HTMLView
        // renderNode={renderNode}
        value={`<div>${i18n.t("activity_item.header.to",
            {
                from: getUserHtml(user),
                to: getUserHtml(target),
                what: getItemHtml(activity)
            }
        )}</div>`}
        stylesheet={htmlStyles}
    />

    return {
        textNode,
        content: activity.description
    }
}

function renderComment(activity) {
    let target = activity.target
    const user = activity.user
    let textNode = <HTMLView
        // renderNode={renderNode}
        value={`<div>${i18n.t("activity_item.header.to",
            {
                from: getUserHtml(user),
                to: getUserHtml(target),
                what: getItemHtml(activity)
            }
        )}</div>`}
        stylesheet={htmlStyles}
    />

    return {
        textNode,
        content: activity.description
    }
}

function getUserHtml(user: User) {
    let userUrl = buildUserUrl(user)
    return `<a href="${userUrl}">${fullName(user)}</a>`
}

function getLineupHtml(lineup: Lineup) {
    let lineupUrl = buildLineupUrl(lineup)
    return `<a href="${lineupUrl}">${truncate(lineup.name)}</a> (${savingCount(lineup)})`
}

function buildLineupUrl(lineup: Lineup): string {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/lists/${lineup.id}`
}

function buildUserUrl(user: User): string {
    return `${Config.GOODSH_PROTOCOL_SCHEME}://it/users/${user.id}`
}

function renderAsk(activity: Activity) {
    let textNode = <HTMLView
        // renderNode={renderNode}
        value={`<div>${i18n.t("activity_item.header.ask", {asker: getUserHtml(activity.user)})}</div>`}
        stylesheet={htmlStyles}
    />

    return {textNode, content: activity.content}
}



const htmlStyles = StyleSheet.create({

    div: {
        fontFamily: SFP_TEXT_MEDIUM,
        fontSize: 14,
        color: Colors.greyishBrown
    },
    a: {
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 16,
        color: Colors.darkerBlack,
    },
    i: {
        fontFamily: SFP_TEXT_ITALIC,
        fontSize: 15,
        color: Colors.black
    },
})
