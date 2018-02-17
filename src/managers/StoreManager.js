// @flow
import {Navigation} from 'react-native-navigation';
import type {Id} from "../types";
import {mergeItemsAndPendings} from "../helpers/ModelUtils";
import {SAVE_ITEM} from "../ui/lineup/actionTypes";

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

}

export interface StoreManager {

    init(store: *): void;

    isItemPendingAdd(itemId: Id): boolean;

}

module.exports = new _StoreManager();
