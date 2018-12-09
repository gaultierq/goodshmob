import type {Activity, Lineup, NavParams, User} from "../types"
import {fullName, savingCount} from "../helpers/StringUtils"
import HTMLView from "react-native-htmlview/HTMLView"
import React from "react"
import {isAsking, isComment, isLike, isSaving, isSending, sanitizeActivityType} from "../helpers/DataUtils"
import {StyleSheet} from "react-native"
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "./fonts"
import {Colors} from "./colors"
import NavManager from "../managers/NavManager"
import URL from "url-parse"
import {CREATE_LIKE, DELETE_LIKE} from "./activity/actionTypes"
import {buildLineupUrl, buildUserUrl} from "../managers/Links"


export function getActivityText(activity: Activity, navP: NavParams): () => any {
    if (isSaving(activity)) return _renderSavedInList(activity, navP)
    else if (isSending(activity)) return _renderSendTo(activity)
    else if (isAsking(activity)) return renderAsk(activity)
    else if (isComment(activity)) return renderComment(activity)
    else if (isLike(activity)) return renderLike(activity)
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
    let item = activity.resource
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
                    what: getItemHtml(item)
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

function getItemHtml(item: Item) {
    return `<i>${truncate(item.title)}</i>`
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
    const item = activity.resource
    let textNode = <HTMLView
        // renderNode={renderNode}
        value={`<div>${i18n.t("activity_item.header.to",
            {
                from: getUserHtml(user),
                to: getUserHtml(target),
                what: getItemHtml(item)
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
    let resource = _.get(activity, 'resource')


    if (sanitizeActivityType(resource.type) === 'asks') {
        return renderAnswerToAsk(activity)
    }
    //saving
    //send
    let item = resource.resource


    const user = activity.user
    let textNode = <HTMLView
        // renderNode={renderNode}
        value={`<div>${i18n.t("activity_item.header.comment",
            {
                commenter: getUserHtml(user),
                what: getItemHtml(item)
            }
        )}</div>`}
        stylesheet={htmlStyles}
    />

    return {
        textNode,
        content: activity.description
    }
}

function renderAnswerToAsk(activity) {
    const user = activity.user
    const resource = _.get(activity, 'resource')
    let textNode = <HTMLView
        value={`<div>${i18n.t("activity_item.header.answer",
            {
                answerer: getUserHtml(user),
                what: `<i>${truncate(resource.content)}</i>`
            }
        )}</div>`}
        stylesheet={htmlStyles}
    />

    return {
        textNode,
        content: activity.description
    }
}

function renderLike(activity) {
    let resource = _.get(activity, 'resource.resource')
    const user = activity.user
    let textNode = <HTMLView
        // renderNode={renderNode}
        value={`<div>${i18n.t("activity_item.header.like",
            {
                liker: getUserHtml(user),
                what: getItemHtml(resource)
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

export function getPendingLikeStatus(pending, activity) {
    let pendingLikes = _.filter(pending[CREATE_LIKE], (o) => o.payload.activityId === activity.id)
    let pendingUnlikes = _.filter(pending[DELETE_LIKE], (o) => o.payload.activityId === activity.id)

    let both = _.concat(pendingLikes, pendingUnlikes)
    both = _.orderBy(both, 'insertedAt')
    let last = _.last(both)

    return last ? (last.pendingActionType === 'like' ? 1 : -1) : 0
}
