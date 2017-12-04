// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import {sanitizeActivityType} from "../utils/DataUtils";
import update from "immutability-helper";

const initialState = Immutable();

let deleteItem = function (state, path, predicate) {
    let data = _.get(state, path, []);
    let indexToRemove = data.findIndex(predicate);
    let obj = _.set({}, path, {$splice: [[indexToRemove, 1]]});
    state = update(state, obj);
    return state;
};

export default function reduce(state:any = initialState, action: any) {
    switch (action.type) {
        case types.LIKE.success():
            break;
        case types.UNLIKE.success():{
            let {type, id} = action.options;
            type = sanitizeActivityType(type);

            state = Immutable.setIn(state, [type, id, "meta", "liked"], false);
            let newVar = [type, id, "meta", "likes-count"];

            let count = state.getIn(newVar);
            state = Immutable.setIn(state, newVar, --count);
            break;
        }
        case types.UNSAVE.success():{
            const {id, lineupId} = action.options;

            //update item saved-in
            {
                const resource = _.get(state, `savings.${id}.relationships.resource.data`, {});

                state = deleteItem(state, `${resource.type}.${resource.id}.meta.saved-in`, item => item === lineupId);
            }

            //decrement
            {
                let path = `lists.${lineupId}.meta.savings-count`;
                let count = _.get(state, path);
                count = --count >= 0 ? count : 0;
                let obj = _.set({}, path, {$set: count});
                state = update(state, obj);
            }

            //remove savings
            {
                state = deleteItem(state, `lists.${lineupId}.relationships.savings.data`, item => item.id === id);
            }



            break;
        }
    }
    return state;
}
