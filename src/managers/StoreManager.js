// @flow
import {Navigation} from 'react-native-navigation';
import type {Id, ItemType, Saving} from "../types";
import {mergeItemsAndPendings} from "../helpers/ModelUtils";
import {CREATE_LINEUP, SAVE_ITEM} from "../ui/lineup/actionTypes";
import {buildData} from "../helpers/DataUtils";
import {UNSAVE} from "../ui/activity/actionTypes";
import {isId} from "../helpers/StringUtils";
import {FOLLOW_LINEUP, UNFOLLOW_LINEUP} from "../ui/lineup/actions"

// export const DEEPLINK_OPEN_SCREEN_IN_MODAL = 'DEEPLINK_OPEN_SCREEN_IN_MODAL';


class _StoreManager implements StoreManager {

    store: *;

    //TODO: organise pending actions / time instead of ADD and thend DELETE

    init(store: *) {
        this.store = store;
    }


    isItemPendingAdd(itemId: Id): boolean {
        let result = mergeItemsAndPendings(
            [],
            this.store.getState().pending[SAVE_ITEM],
            [],
            (pending) => ({
                itemId: pending.payload.itemId,
            })
        );

        return !_.isEmpty(_.filter(result, pending => pending.itemId === itemId));
    }

    isListPendingFollowOrUnfollow(listId: Id, pending?: any): boolean {
        if (!pending) {
            pending = this.store.getState().pending
        }
        return _StoreManager.isPendingFoU(listId, pending)
    }

    static isPendingFoU(listId, pending) {
        let finder = pendings => _.some(pendings, p => _.get(p, 'payload.id') === listId)
        return finder(pending[FOLLOW_LINEUP]) || finder(pending[UNFOLLOW_LINEUP])
    }

    getMySavingsForItem(itemId: Id, itemType: ItemType): Saving[] {
        let storeData = this.store.getState().data;
        let storePending = this.store.getState().pending;

        let item = buildData(storeData, itemType, itemId);

        //persisted savings
        let savingIds = _.get(item, 'meta.mySavings', []);

        // pending savings
        const predicate = pending => pending.payload.itemId === itemId;

        //mergeItemsAndPendings2
        let savings = savingIds.map(id => ({id}));

        const pendingCreation = _.filter(storePending[SAVE_ITEM], predicate);
        savings = savings.concat(pendingCreation.map(pending => ({
                id: pending.id,
                lineupId: pending.payload.lineupId,
                pending: true
            })
        ));
        savings = _.filter(savings, saving => {
            return _.findIndex(storePending[UNSAVE], o => o.payload.savingId === saving.id) < 0;
        });
        return savings;
    }

    getLineupAndSavings(lineupId: Id) {
        let savings = [];
        let storeData = this.store.getState().data;
        let storePending = this.store.getState().pending;
        let lineup;
        if (isId(lineupId)) {
            lineup = buildData(storeData, 'lists', lineupId);
        }
        else {
            let pending = _.head(storePending[CREATE_LINEUP], pending => pending.id === lineupId);
            if (pending) {
                lineup = {
                    name: pending.payload.listName,
                    pending: true
                }
            }
        }


        if (lineup && lineup.savings) {
            savings.push(...lineup.savings);
        }

        savings = this.synthetizePendingSavings(storeData, storePending, lineupId).concat(savings)

        savings = _.filter(savings, saving => {
            return _.findIndex(storePending[UNSAVE], o => o.payload.savingId === saving.id) < 0;
        });

        return {lineup, savings};
    }

    buildData(type: string, id: Id): Saving {
        let storeData = this.store.getState().data;
        return buildData(storeData, type, id);
    }

    getStore(): any {
        return this.store
    }

    synthetizePendingSavings(storeData, storePending, lineupId) {
        const rawPending = _.filter(storePending[SAVE_ITEM], pending => pending.payload.lineupId === lineupId)
        return rawPending.map(pending => {
                const result = {
                    id: pending.id,
                    lineupId: pending.payload.lineupId,
                    itemId: pending.payload.itemId,
                    pending: true
                }

                Object.defineProperty(
                    result,
                    'resource',
                    {
                        get: () => {
                            return buildData(storeData, pending.payload.itemType, pending.payload.itemId)
                        },
                    },
                )
                return result
            }
        )
    }

}

export interface StoreManager {

    init(store: *): void;

    isItemPendingAdd(itemId: Id): boolean;

    isListPendingFollowOrUnfollow(listId: Id): boolean;

    getMySavingsForItem(itemId: Id, itemType: ItemType): Saving[];

    buildData(type: string, id: Id): Saving;

    getStore(): any

}

module.exports = new _StoreManager();
