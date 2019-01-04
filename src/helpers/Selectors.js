import {createSelector, createSelectorCreator, defaultMemoize} from "reselect"
import {CREATE_LINEUP, DELETE_LINEUP, FOLLOW_LINEUP, SAVE_ITEM, UNFOLLOW_LINEUP, UNSAVE} from "../ui/lineup/actionTypes"
import {LineupRights} from "../ui/lineupRights"
import {isEqualsArrayFree} from "./ArrayUtil"
import {hashCode} from "./StringUtils"
import {createCounter} from "./DebugUtils"
import {getUserActions} from "../ui/userRights"


const logger = rootlogger.createLogger("selectors")

let thrown = message => {throw message}
export let lineupId = props => _.get(props, 'lineupId') || _.get(props, 'lineup.id')
export let userId = props => props.userId || _.get(props, 'user.id')
let savingId = props => props.savingId || _.get(props, 'saving.id')
export const lineupIdExtract = (state, props) => lineupId(props)
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
        (state, props) => props.lineup || props.lineupId && {id: props.lineupId},
        (state, props) => _.get(state, `data.lists.${lineupId(props)}`),
        (state, props) => _.head(state.pending[CREATE_LINEUP], pending => pending.id === lineupId(props)),
    ],
    (
        propLineup, // lineup provided in props
        syncList, // lineup synchronized in data
        rawPendingList, // lineup in pending
    ) => {
        let lineup
        if (syncList) {
            lineup = createObj(syncList)
            if (lineup.primary === true) {
                lineup.name = i18n.t('lineups.goodsh.title')
            }
        }
        else if (rawPendingList) {
            lineup = {id: rawPendingList.id, name: rawPendingList.payload.listName, savings: []}
        }
        else {
            lineup = propLineup
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
export const PENDING_SAVINGS_SELECTOR = () => createSelector(
    [
        lineupIdExtract,
        state => state.pending[SAVE_ITEM],
        state => state.pending[UNSAVE],
    ],
    (
        lineupId,
        pendingSaveStore,
        pendingUnsaveStore,
    ) => {

        const pendingSave = _.filter(pendingSaveStore, pending => pending.payload.lineupId === lineupId)
        const pendingUnsave = _.filter(pendingUnsaveStore, pending => pending.payload.lineupId === lineupId)
        counter(`PENDING_SAVINGS_SELECTOR.${lineupId}`)
        return {pendingSave, pendingUnsave}
    }
)

export const PENDING_LINEUPS_SELECTOR = () => createSelector(
    [
        userIdExtract,
        state => _.get(state, `pending.${CREATE_LINEUP}`, []),
        state => _.get(state, `pending.${DELETE_LINEUP}`, []),
    ],
    (
        userIdExtract,
        pendingCreate,
        pendingDelete,
    ) => {
        counter(`PENDING_LINEUPS_SELECTOR.user-${userIdExtract}`)
        return {pendingCreate, pendingDelete}
    }
)


// [obj1] === [obj1] !
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
            counter(`SAVING_LIST_SELECTOR_STORE.${hashCode(savings.map(s => _.get(s, 'id')).join(' '))}`)
            return savings
        }
    )
}


export const LIST_SAVINGS_SELECTOR = () => {

    const savingsSelector = SAVING_LIST_SELECTOR_STORE()
    const pendingSelector = PENDING_SAVINGS_SELECTOR()

    return createSelector1(
        [
            (state, props) => props.savings,
            lineupIdExtract,
            savingsSelector,
            (state, props) => {
                let savings = savingsSelector(state, props)
                let items = savings.map(s => s && s.resource)
                return items.map(s => {
                    if (!s) return null
                    let {id, type} = s
                    return _.get(state, `data.${type}.${id}`)
                })
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
            if (propsSaving) return propsSaving
            let savings = pendingSave.map(pending => savingFromPending(pending))
            syncedSavings = _.filter(syncedSavings)
            syncedSavings.forEach((s, index) => {
                if (s) {
                    s.resource = createObj(syncedItems[index]) || s.resource
                }
            })
            savings = savings.concat(syncedSavings)

            _.remove(savings, (saving) => pendingUnsave.some(pending => pending.payload.savingId === saving.id))

            counter(`SAVING_LIST_SELECTOR.${lineupId}`)
            return savings
        }
    )
}

export const LINEUP_LIST_SELECTOR = () => {

    const pendingSelector = PENDING_LINEUPS_SELECTOR()
    const lineupSel = LINEUP_SELECTOR()

    return createSelector1(
        [
            userIdExtract,
            (state, props) => {
                let shallowLists = _.get(state, `data.users.${userId(props)}.relationships.lists.data`, [])
                return shallowLists.map(lineup => lineupSel(state, {lineup}))
            },
            pendingSelector,
        ],
        (
            userId,
            syncedLineups,
            {pendingCreate, pendingDelete},
        ) => {
            const lineups = syncedLineups
            let pending = pendingCreate.map(pending => lineupFromPending(pending))
            lineups.splice(1, 0, ...pending)

            _.remove(lineups, lineup => pendingDelete.some(pending => pending.payload.lineupId === lineup.id))

            counter(`LINEUP_LIST_SELECTOR.${userId}`)
            return {lineups}
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
        (state, props) => _.get(state, `data.lists.${lineupId(props)}.meta.followed`, false),
        PENDING_FOLLOWS_SELECTOR,

    ],
    (lineupId, syncedFollowed, {pendingFollow, pendingUnfollow}) => {
        if (!_.isEmpty(pendingFollow)) return true
        if (!_.isEmpty(pendingUnfollow)) return false
        counter(`LINEUP_FOLLOWED_SELECTOR.${lineupId}`)
        return syncedFollowed
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

    return createSelector1(
        [
            (state, props) => {
                const rights = LineupRights.create(lineupId(props), state)
                return rights.allActions()
            }
        ],
        actions => actions
    )
}
export const USER_ACTIONS_SELECTOR = () => {
    const user = USER_SELECTOR()
    return createSelector(
        [
            user,
            state => _.get(state, `pending`),
        ],
        (lineup, pending) => {
            counter(`LINEUP_ACTIONS_SELECTOR.${_.get(lineup, 'id')}`)
            return getUserActions(user, pending)
        }
    )
}

export const USER_SELECTOR2 = user => createSelector(
    state => _.get(state, `data.users.${_.get(user, 'id')}`),
    syncUser => createObj(syncUser)
)


let createMemoizeIdSelector = createSelectorCreator(_.memoize, s => _.get(s, 'id'))


//will not listen to user attributes changes
const _userSelector = createMemoizeIdSelector(
    (state, props) =>  _.get(state, `data.users.${userId(props)}`),
    userData => createObj(userData)
)


//deprecated
export const USER_SELECTOR = () => createSelector(
    [
        userIdExtract,
        (state, props) => props.user,
        (state, props) => _.get(state, `data.users.${userId(props)}`),
    ],
    (
        userId,
        propUser,
        syncUser,
    ) => {
        let res
        if (syncUser) res = createObj(syncUser)
        else if (propUser) res = propUser
        else if (userId) res = {id: userId}
        counter(`USER_SELECTOR.${userId}`)
        return res
    }
)
let userMetaSelector = (s) => () => createSelector(
    [
        userIdExtract,
        (state, props) => _.get(state, `data.users.${userId(props)}.meta.${s}`, 0),
    ],
    (userId, syncedCount) => {
        counter(`USER_${s.toUpperCase()}_SELECTOR.${userId}`)
        return syncedCount
    }
)

export const USER_SYNCED_SAVINGS_COUNT_SELECTOR = userMetaSelector(`savingsCount`)
export const USER_SYNCED_LINEUPS_COUNT_SELECTOR = userMetaSelector(`lineupsCount`)
export const USER_SYNCED_FRIENDS_COUNT_SELECTOR = userMetaSelector(`friendsCount`)
export const USER_SYNCED_FOLLOWED_SELECTOR = userMetaSelector(`followed`)


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

export const LAST_ACTIVE_USERS_SELECTOR = () => {
    return createSelector1(
        (state, props) => {
            const list = _.get(state, `last_active_users.${userId(props)}.list`, [])
            return list.map(user => _userSelector(state, {user}))
        },
        users => {
            counter(`LAST_ACTIVE_USERS_SELECTOR.${hashCode(users.map(s => _.get(s, 'id')).join(' '))}`)
            return users
        }
    )
}


export const FRIENDS_SELECTOR = () => {
    return createSelector1(
        (state, props) => {
            const list = _.get(state, `data.users.${userId(props)}.relationships.friends.data`, [])
            return list.map(user => _userSelector(state, {user}))
        },
        friends => {
            counter(`FRIENDS_SELECTOR.${hashCode(friends.map(s => _.get(s, 'id')).join(' '))}`)
            return friends
        }
    )
}

