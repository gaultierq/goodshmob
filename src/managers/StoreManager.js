// @flow
import {Navigation} from 'react-native-navigation';
import type {Id, ItemType, Saving} from "../types";
import {mergeItemsAndPendings} from "../helpers/ModelUtils";
import {SAVE_ITEM} from "../ui/lineup/actionTypes";
import {buildData} from "../helpers/DataUtils";
import {UNSAVE} from "../ui/activity/actionTypes";

// export const DEEPLINK_OPEN_SCREEN_IN_MODAL = 'DEEPLINK_OPEN_SCREEN_IN_MODAL';

class _StoreManager implements StoreManager {

    store: *;

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

}

export interface StoreManager {

    init(store: *): void;

    isItemPendingAdd(itemId: Id): boolean;

    getMySavingsForItem(itemId: Id, itemType: ItemType): Saving[];

}

module.exports = new _StoreManager();
