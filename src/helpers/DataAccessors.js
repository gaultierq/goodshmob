// @flow

import type {Id, Lineup} from "../types"
import {FETCH_LINEUP, fetchLineup} from "../ui/lineup/actions"
import StoreManager from "../managers/StoreManager"

export function getLineup(lineupId: Id, options?: any): Promise<Lineup> {

    const _getLineup = () => StoreManager.buildData('lists', lineupId)
    return new Promise((resolve, reject) => {
        if (!lineupId) {
            reject("lineupId not provided")
            return
        }

        let lineup = _getLineup()
        if (lineup) {
            resolve(lineup)
        }
        else {
            fetchLineup(lineupId)
                .createActionDispatchee(FETCH_LINEUP, options)
                .catch(reject)
                .then(()=> {
                    let l = _getLineup()
                    if (l) resolve(l)
                    else reject("Lineup requested, but not found in data store")
                })
        }
    })
}