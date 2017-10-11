// @flow

import type {Store} from 'redux'



class CurrentUser {

    store;

    constructor() {
        Object.defineProperty(
            this,
            'id',
            {
                get: () => {
                    return this.store ? this.store.getState().auth.currentUserId : null;
                },
            },
        );
    }

    init(store: Store) {
        this.store = store;
    }


}

let instance = new CurrentUser();


export function init(store:Store) {
    instance.init(store);
}

export default instance;