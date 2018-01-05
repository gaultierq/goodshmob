// @flow

import type {Store} from 'redux';
import {buildNonNullData} from "../helpers/DataUtils";
import type {Id, User} from "../types";
import Scope from "./Scope";
import {Component} from 'react';

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

    isLogged() {
        return !!this.id();
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

//FIXME! learn to create a proper HOC
export function logged(target) {
    // return target;
    return Scope(target);
}


export default instance;