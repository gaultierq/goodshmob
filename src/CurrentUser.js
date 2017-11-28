// @flow

import type {Store} from 'redux'
;
import {buildNonNullData} from "./utils/DataUtils";
import type {Id} from "./types";


class CurrentUser {

    store: Store<*,*>;

    // constructor() {
    //     Object.defineProperty(
    //         this,
    //         'id',
    //         {
    //             get: () => {
    //                 return this.store ? this.store.getState().auth.currentUserId : null;
    //             },
    //         },
    //     );
    // }
    //
    id() {
        return this.store ? this.store.getState().auth.currentUserId : null;
    }

    currentGoodshboxId() {
        let state = this.store.getState();
        let userId : Id = this.id();
        return _.get(state, `data.users.${userId}.relationships.goodshbox.data.id`, null);
    }

    init(store: Store<*,*>) {
        this.store = store;
    }


}

let instance = new CurrentUser();


export function init(store:Store<*,*>) {
    instance.init(store);
}

export function currentUserId() : Id {
    return instance.id();
}

export function currentGoodshboxId() {
    return instance.currentGoodshboxId();
}


export default instance;