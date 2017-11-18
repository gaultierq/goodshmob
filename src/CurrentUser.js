// @flow

import type {Store} from 'redux'
import * as _ from "lodash";
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

    currentGoodshbox() {
        let state = this.store.getState();
        let userId : Id = this.id();
        let goodshboxId = _.get(state, `data.users.${userId}.relationships.goodshbox.data.id`, null);
        return buildNonNullData(state.data, "lists", goodshboxId);
    }

    init(store: Store<*,*>) {
        this.store = store;
    }


}

let instance = new CurrentUser();


export function init(store:Store<*,*>) {
    instance.init(store);
}

export function currentUserId() {
    return instance.id();
}

export function currentGoodshbox() {
    return instance.currentGoodshbox();
}


export default instance;