// @flow

import {CREATE_LINEUP, DELETE_LINEUP, SAVE_ITEM, CREATE_AND_SAVE_ITEM} from "./actionTypes"
import {currentUserId} from "../../managers/CurrentUser"
import {doDataMergeInState} from "../../helpers/DataUtils"
import dotprop from "dot-prop-immutable"

export default (state = {}, action = {}) => {
    switch (action.type) {
        case CREATE_LINEUP.success(): {
            let userId = currentUserId();
            let {id, type} = action.payload.data;
            let path = `users.${userId}.relationships.lists.data`;

            //let goodshboxId = _.get(state, `users.${userId}.relationships.goodshbox.data.id`, null);

            //temp hack
            let goodshboxId = _.get(state, `users.${userId}.relationships.lists.data.0.id`, null);
            state = doDataMergeInState(state, path, [{id, type}], {afterId: goodshboxId});
            break;
        }

        case DELETE_LINEUP.success(): {
            let userId = currentUserId();
            let {lineupId} = action.options;
            let path = `users.${userId}.relationships.lists.data`;
            let lists = _.get(state, path, null);
            lists = _.filter(lists, (l) => l.id !== lineupId);
            state = dotprop.set(state, path, lists);
            break;
        }
        case SAVE_ITEM.success():
        case CREATE_AND_SAVE_ITEM.success(): {
            let {id, type} = action.payload.data;
            let {lineupId} = action.options;
            let path = `lists.${lineupId}.relationships.savings.data`;
            let savings = _.get(state, path, null);
            if (savings) {
                savings = savings.slice();
                savings.splice(0, 0, {id, type});
                state = dotprop.set(state, path, savings);
            }
            break;
        }
    }
    return state;
};
