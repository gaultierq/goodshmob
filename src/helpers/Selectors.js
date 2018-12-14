import {createSelector, createSelectorCreator, defaultMemoize} from "reselect"
import {CREATE_LINEUP, DELETE_LINEUP, FOLLOW_LINEUP, SAVE_ITEM, UNFOLLOW_LINEUP, UNSAVE} from "../ui/lineup/actionTypes"
import {buildData} from "./DataUtils"
import {LineupRights} from "../ui/lineupRights"
import {isEqualsArrayFree} from "./ArrayUtil"
import {hashCode} from "./StringUtils"
import {createCounter} from "./DebugUtils"


const logger = rootlogger.createLogger("selectors")

let thrown = message => {throw message}
let lineupId = props => _.get(props, 'lineupId') || _.get(props, 'lineup.id') || thrown("you")
let userId = props => props.userId || _.get(props, 'user.id')
let savingId = props => props.savingId || _.get(props, 'saving.id')
const lineupIdExtract = (state, props) => lineupId(props)
const userIdExtract = (state, props) => userId(props)

const counter = createCounter(logger, 10000)

export function createObj(source: any) {
    if (!source) return null
    let ret = {}
    if (source.id) {
        ret.id = source.id
    }
    if (source.meta) {
        ret.meta = source.meta

    }
    if (source.type) {
        ret.type = source.type

    }
    Object.keys(source.attributes).forEach((key) => {
        ret[key] = source.attributes[key]

    })
    if (source.relationships) {
        Object.keys(source.relationships).forEach((relationship) => {
            ret[relationship] = source.relationships[relationship].data
        })


    }
    return ret

}


export const LINEUP_SELECTOR = () => createSelector(
    [
        // (state, props) => props.lineup,
        (state, props) => _.get(state, `data.lists.${lineupId(props)}`),
        (state, props) => _.head(state.pending[CREATE_LINEUP], pending => pending.id === lineupId(props)),
    ],
    (
        // propLineup, // lineup provided in props
        syncList, // lineup synchronized in data
        rawPendingList, // lineup in pending
    ) => {
        let lineup
        if (syncList) {
            lineup = createObj(syncList)
        }
        else if (rawPendingList) {
            lineup = {id: rawPendingList.id, name: rawPendingList.payload.listName, savings: []}
        }
        else {
            // lineup = propLineup
            lineup = null
        }
        counter(`LINEUP_SELECTOR.${_.get(lineup,'id')}`)
        return lineup
    }
)

export const LINEUP_AUTHOR = () => {
    return createSelector(
        (state, props) => {
            const listAuthor = _.get(state, `data.lists.${lineupId(props)}.relationships.user.data`)
            return USER_SELECTOR2(listAuthor)(state, props)
        },
        author => author
    )
}


export const PENDING_FOLLOWS_SELECTOR = () => createSelector(
    [
        lineupIdExtract,
        state => state.pending[FOLLOW_LINEUP],
        state => state.pending[UNFOLLOW_LINEUP],
    ],
    (
        lineupId,
        pendingFollowStore,
        pendingUnfollowStore,
    ) => {

        const pendingFollow = _.filter(pendingFollowStore, pending => pending.payload.id === lineupId)
        const pendingUnfollow = _.filter(pendingUnfollowStore, pending => pending.payload.id === lineupId)

        return {pendingFollow, pendingUnfollow}
    }
)

export const PENDING_LINEUPS_SELECTOR = () => createSelector(
    [
        userIdExtract,
        state => state.pending[CREATE_LINEUP],
        state => state.pending[DELETE_LINEUP],
    ],
    (
        userIdExtract,
        pendingCreateStore,
        pendingDeleteStore,
    ) => {
        counter(`PENDING_SAVINGS_SELECTOR.user-${userIdExtract}`)
        return {pendingCreateStore, pendingDeleteStore}
    }
)



const createSelector1 = createSelectorCreator(
    defaultMemoize,
    isEqualsArrayFree
)


const SAVING_LIST_SELECTOR_STORE = () => {

    let createCustomSelector = createSelectorCreator(_.memoize, s => _.get(s, 'id'))
    const savingSel = createCustomSelector(
        (state, props) =>  _.get(state, `data.savings.${savingId(props)}`),
        savingData => createObj(savingData)
    )

    return createSelector1(
        (state, props) => {
            const list = _.get(state, `data.lists.${lineupId(props)}.relationships.savings.data`, [])

            return list.map(saving => savingSel(state, {saving}))
        },
        savings => {
            let code = hashCode(savings.map(s => s.id).join(' '))
            counter(`SAVING_LIST_SELECTOR_STORE.${code}`)
            return savings
        }
    )
}

export const SAVING_LIST_SELECTOR = () => {

    const savingsSelector = SAVING_LIST_SELECTOR_STORE()
    const pendingSelector = PENDING_SAVINGS_SELECTOR()

    return createSelector1(
        [
            (state, props) => props.savings,
            lineupIdExtract,
            savingsSelector,
            (state, props) => {
                let savings = savingsSelector(state, props)
                let items = savings.map(s => s.resource)
                return items.map(({id, type}) => _.get(state, `data.${type}.${id}`))
            },
            pendingSelector,
        ],
        (
            propsSaving,
            lineupId,
            syncedSavings,
            syncedItems,
            {pendingSave, pendingUnsave},
        ) => {
            if (propsSaving) return propsSaving.map(s => ({saving: s, from: 'props'}))
            let savings = pendingSave.map(pending => ({saving: savingFromPending(pending), from: 'pending'}))

            syncedSavings.forEach((s, index) => {
                s.resource = createObj(syncedItems[index]) || s.resource
            })
            savings = savings.concat(syncedSavings.map(s => ({saving: s, from: 'store'})))

            _.remove(savings, ({saving}) => pendingUnsave.some(pending => pending.payload.savingId === saving.id))

            counter(`SAVING_LIST_SELECTOR.${lineupId}`)
            return savings
        }
    )
}


export const LINEUP_SAVING_COUNT_SELECTOR = () => {
    const pendingSavingsSel = PENDING_SAVINGS_SELECTOR()

    return createSelector(
        [
            lineupIdExtract,
            (state, props) => _.get(state, `data.lists.${lineupId(props)}.meta.savingsCount`, -1),
            pendingSavingsSel,

        ],
        (lineupId, syncedCount, {pendingSave, pendingUnsave}) => {
            let unsyncedDelta = pendingSave.length - pendingUnsave.length
            counter(`LINEUP_SAVING_COUNT_SELECTOR.${lineupId}`)
            return {total: syncedCount + unsyncedDelta, syncedCount, unsyncedDelta}
        }
    )
}
const boolToOne = bool => bool ? 1 : 0
export const LINEUP_FOLLOWED_SELECTOR = () => createSelector(
    [
        lineupIdExtract,
        (state, props) => _.get(state, `data.lists.${lineupId(props)}.meta.followed`),
        PENDING_FOLLOWS_SELECTOR,

    ],
    (lineupId, syncedFollowed, {pendingFollow, pendingUnfollow}) => {
        let unsyncedDelta = boolToOne(!_.isEmpty(pendingFollow)) - boolToOne(!_.isEmpty(pendingUnfollow))
        let pendingFollowed = unsyncedDelta === 0 && unsyncedDelta > 0
        return {total: syncedCount + unsyncedDelta, syncedCount, unsyncedDelta}
    }
)
export const LINEUP_FOLLOWS_COUNT_SELECTOR = () => {
    const pendingFollowsSel = PENDING_FOLLOWS_SELECTOR()

    return createSelector(
        [
            lineupIdExtract,
            (state, props) => _.get(state, `data.lists.${lineupId(props)}.meta.followersCount`),
            pendingFollowsSel,

        ],
        (lineupId, syncedCount, {pendingFollow, pendingUnfollow}) => {
            let unsyncedDelta = boolToOne(!_.isEmpty(pendingFollow)) - boolToOne(!_.isEmpty(pendingUnfollow))
            counter(`LINEUP_FOLLOWS_COUNT_SELECTOR.${lineupId}`)
            return {total: syncedCount + unsyncedDelta, syncedCount, unsyncedDelta}
        }
    )
}
export const LINEUP_ACTIONS_SELECTOR = () => {
    const lineup = LINEUP_SELECTOR()
    return createSelector(
        [
            lineup,
            state => _.get(state, `pending`),
        ],
        (lineup, pending) => {
            counter(`LINEUP_ACTIONS_SELECTOR.${_.get(lineup, 'id')}`)
            return LineupRights.getActions(lineup, pending)
        }
    )
}

export const USER_SELECTOR2 = user => createSelector(
    state => _.get(state, `data.users.${_.get(user, 'id')}`),
    syncUser => createObj(syncUser)
)

//deprecated
export const USER_SELECTOR = () => createSelector(
    [
        (state, props) => props.user,
        (state, props) => _.get(state, `data.users.${userId(props)}`),
        state => state.data
    ],
    (
        propUser,
        syncUser,
        data
    ) => {
        let res
        if (syncUser) res = buildData(data, syncUser.type, syncUser.id)
        else if (propUser) res = propUser
        counter(`USER_SELECTOR.${_.get(user, 'id')}`)
        return res
    }
)

let savingFromPending = function (pending) {
    return {
        id: pending.id,
        type: 'savings',
        lineupId: pending.payload.lineupId,
        itemId: pending.payload.itemId,
        pending: true,
        resource: pending.payload.item
    }
}

let lineupFromPending = function (pending) {
    return {
        id: pending.id,
        name: pending.payload.listName,
        savings: [],
        type: 'lists', //here ? or reducer ?
        pending: true,
    }
}


