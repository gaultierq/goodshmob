import * as ModelUtils from "../src/utils/ModelUtils"

test('testing merge 1', () => {
    testMerge([4, 6, 5, 7, 9, 12, 77, 1], [7, 12, 77], 5, false, null, [4, 6, 5, 7, 12, 77]);
});
test('testing merge 2', () => {
    testMerge([4, 6, 5], [], null, false, null, [4, 6, 5]);
});
test('testing merge 3', () => {
    testMerge([4, 6, 5], [5], null, false, null, [4, 6, 5]);
});
test('testing merge 4', () => {
    testMerge([4, 6, 5], [4], null, false, null, [4]);
});
test('testing merge 5', () => {
    testMerge([4, 6, 5, 7, 9, 12, 77, 1], [7, 12, 77], null, false, false, [7, 12, 77]);
});

function testMerge(into: number[], add: number[], after:number, hasMore: boolean, hasLess: boolean, expected: number[]) {
    let mergeInto = makeList(into);
    let mergeMe = makeList(add);
    let lastId = after === null ? null : `${after}`;
    let result = new ModelUtils.Merge(mergeInto, mergeMe)
        .setAfterKey(lastId)
        .hasMore(hasMore)
        .withHasLess(hasLess)
        .merge();

    let newIds = mergeInto.map((e) => e.id);
    let expectedList = makeList(expected);
    let expectedIds = expectedList.map((e) => e.id);

    expect(newIds).toEqual(expectedIds);
}

function makeList(baseIndex: number[]) {

    return baseIndex.map((id) => {
        return {id: id, value: new Date()};
    });
}



