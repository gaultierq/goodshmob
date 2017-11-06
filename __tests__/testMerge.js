import * as ModelUtils from "../src/utils/ModelUtils"
import type {MergeOptions} from "../src/utils/ModelUtils";
import {mergeLists} from "../src/utils/ModelUtils";

test('testing merge 1', () => {
    expect(
        doMerge([4, 6, 5, 7, 9, 12, 77, 1], [7, 12, 77], {afterId: `5`, hasMore: false}))
        .toEqual([4, 6, 5, 7, 12, 77]);
});

test('testing merge 2', () => {
    expect(
        doMerge([4, 6, 5], [], {hasMore: false}))
        .toEqual([4, 6, 5]);
});

test('testing merge 3', () => {
    expect(doMerge([4, 6, 5], [5], {hasMore: false})).toEqual([4, 6, 5]);
});

test('testing merge 4', () => {
    expect(doMerge([4, 6, 5], [4], {hasMore: false})).toEqual([4]);
});

test('testing merge 5', () => {
    expect(doMerge([4, 6, 5, 7, 9, 12, 77, 1], [7, 12, 77],
        {
            hasMore: false,
            hasLess: false
        })
    ).toEqual([7, 12, 77]);
});



function doMerge(into, add, options) {
    let mergeInto = makeList(into);
    let mergeMe = makeList(add);

    mergeLists(mergeInto, mergeMe, options);

    return mergeInto.map((e) => e.id);
}

function makeList(baseIndex: number[]) {

    return baseIndex.map((id) => {
        return {id: id, value: new Date()};
    });
}



