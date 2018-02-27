// @flow

import {REHYDRATE} from 'redux-persist/constants'

export const CONNECTIVITY_CHANGE = 'CONNECTIVITY_CHANGE';

export default (state = {}, action) => {
    switch (action.type) {
        case REHYDRATE:
            return {...state, rehydrated: true};
        case CONNECTIVITY_CHANGE:
            return {...state, connected: action.connected};
    }
    return state;
};