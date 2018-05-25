// @flow

import type {Store} from 'redux';
import {buildNonNullData} from "../helpers/DataUtils";
import type {Id, ms, User} from "../types";
import Scope from "./Scope";
import watch from 'redux-watch'
import EventBus from 'eventbusjs'


export const USER_CHANGE = 'USER_CHANGE';

class CurrentUser {

    store: Store<*,*>;

    init(store: Store<*,*>) {
        this.store = store;

        let w = watch(store.getState, 'auth.currentUserId');
        store.subscribe(w((newVal, oldVal, objectPath) => {
            console.info(`auth: currentUserId changed old=${oldVal}, new=${newVal}`);

            const user = this.buildUser(newVal, false);
            console.info(`auth: new user=${JSON.stringify(user)}`);

            EventBus.dispatch(USER_CHANGE, {user});
        }))
    }

    id() {
        return this.store ? this.store.getState().auth.currentUserId : null;
    }

    user(assertNotNull: boolean = true) {
        return this.buildUser(this.id(), assertNotNull);
    }

    //this shoulw always return something !== null if user is logged
    buildUser(id: Id, assertNotNull: boolean) {
        return id ? buildNonNullData(this.store.getState().data, "users", id, assertNotNull) || {id} : null;
    }

    currentGoodshboxId() {
        let state = this.store.getState();
        let userId: Id = this.id();
        return _.get(state, `data.users.${userId}.relationships.goodshbox.data.id`, null);
    }

    loggedSince(): ms {
        if (!isLogged()) return NaN;
        let loggedAt = _.get(this.store.getState(), `auth.loggedAt`, null);
        if (!loggedAt) return NaN;
        return Date.now() - Date.parse(loggedAt);
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

export function listenToUserChange(options: {onUser?:(user: User) => void, onNoUser?:() => void, triggerOnListen?:boolean}) {
    const {onUser, onNoUser, triggerOnListen} = options;


    let callback = user => {
        if (user) onUser && onUser(user);
        else onNoUser && onNoUser();
    };

    let triggering;
    const eventName = USER_CHANGE;

    EventBus.addEventListener(eventName, event => {
        if (triggering) {
            console.warn("looping");
            return;
        }

        const {user} = event.target;
        callback(user);
    });

    if (triggerOnListen) {
        triggering = true;
        callback(currentUser(false));
        triggering = false;
    }
}

export function isLogged() {
    return !!instance.id();
}

export function isCurrentUser(user: User) {
    return instance.id() === (user && user.id);
}
export function isCurrentUserId(userId: Id) {
    return instance.id() === userId;
}

export default instance;