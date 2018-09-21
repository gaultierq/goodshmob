// @flow

import {sanitizeActivityType, updateSplice0} from "../../helpers/DataUtils"
import update from "immutability-helper"
import dotprop from "dot-prop-immutable"
import {CREATE_LIKE, DELETE_LIKE, MOVE_SAVING, UNSAVE} from "./actionTypes"


export default function reduce(state:any = {}, action: any) {
    switch (action.type) {
        case MOVE_SAVING.success():
            let {savingId, originalLineupId, targetLineupId} = action.options;

            state = saveOrUnsave(savingId, originalLineupId, state);
            state = saveOrUnsave(savingId, targetLineupId, state, {id: savingId, type: 'savings'});

            break;
        case CREATE_LIKE.success():
            break;
        case DELETE_LIKE.success():{
            let {type, id} = action.options;
            type = sanitizeActivityType(type);
            state = dotprop.set(state, `${type}.${id}.meta.liked`, false)
            let likeCountPath = `${type}.${id}.meta.likes-count`
            let likeCount = _.get(state, likeCountPath)
            state = dotprop.set(state, likeCountPath, --likeCount)
            break;
        }
        case UNSAVE.success():{
            const {id, lineupId} = action.options;

            state = saveOrUnsave(id, lineupId, state);


            break;
        }
    }
    return state;
}

let saveOrUnsave = (savingId, lineupId, state, newSaving = null) => {
    if (!savingId || !lineupId) throw "please provide options to reducer";


    let isSave = !!newSaving;
    //update item saved-in
    {
        const resource = _.get(state, `savings.${savingId}.relationships.resource.data`, {});

        state = updateSplice0(state, `${resource.type}.${resource.id}.meta.mySavings`, {
            deletePredicate: mySavingId => mySavingId === savingId,
            index: 0,
            insert: isSave ? savingId : null,
        });
    }

    //remove savings from list
    {
        state = updateSplice0(state, `lists.${lineupId}.relationships.savings.data`,
            {
                deletePredicate: item => item.id === savingId,
                index: 0,
                insert: isSave ? newSaving : null,
            }
        );
    }

    //decrement saving count
    {
        let path = `lists.${lineupId}.meta.savings-count`;
        let count = _.get(state, path);
        if (isSave) {
            count ++;
        }
        else {
            count = --count >= 0 ? count : 0;
        }
        let obj = _.set({}, path, {$set: count});
        state = update(state, obj);
    }


    return state;
};
