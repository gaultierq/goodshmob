// @flow

import type {Store} from 'redux';
import {buildNonNullData} from "../helpers/DataUtils";
import type {Id, User} from "../types";


class CurrentUser {

    store: Store<*,*>;

    id() {
        return this.store ? this.store.getState().auth.currentUserId : null;
    }

    user(assertNotNull: boolean = true) {
        return buildNonNullData(this.store.getState().data, "users", this.id(), assertNotNull);
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

export function currentUser(assertNotNull: boolean = true) : User {
    return instance.user(assertNotNull);
}

export function currentGoodshboxId() {
    return instance.currentGoodshboxId();
}


export default instance;