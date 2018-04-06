import merge from '../../vendors/deepmerge'
// import merge from 'deepmerge'
import {Merge} from "../helpers/ModelUtils";
import isMergeableObject from "is-mergeable-object"

import _ from "lodash"

export default function customMerge(source, target, optionsArgument?) {
    return merge(source, target, {arrayMerge: defaultArrayMerge, ...optionsArgument});
}

const defaultAccessor = obj=> obj['id'];

function defaultArrayMerge(target, source, optionsArgument) {
    const accessor = optionsArgument && optionsArgument.keyAccessor ||  defaultAccessor;

    let result = target.slice();

    new Merge(result, source)
        .withKeyAccessor(accessor)
        .withItemMerger((oldItem, newItem) => {
            if (isMergeableObject(newItem)) {
                return merge(oldItem, newItem, optionsArgument);
            }
            return newItem;

        })
        .withHasLess(false)
        .merge();

    //temp
    if (_.isEqual(result, target)) {
        return target;
    }

    return result;
}