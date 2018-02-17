// @flow

import Immutable from 'seamless-immutable';
import * as types from './actionTypes';
import {sanitizeActivityType, updateDelete} from "../../helpers/DataUtils";
import update from "immutability-helper";

const initialState = Immutable();


export default function reduce(state:any = initialState, action: any) {
    switch (action.type) {
        case types.CREATE_LIKE.success():
            break;
        case types.DELETE_LIKE.success():{
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

                state = updateDelete(state, `${resource.type}.${resource.id}.meta.mySavings`, it => it === id);
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
                state = updateDelete(state, `lists.${lineupId}.relationships.savings.data`, item => item.id === id);
            }



            break;
        }
    }
    return state;
}
