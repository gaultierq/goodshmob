import {mergeLists} from "../src/helpers/ModelUtils"

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

test('testing insert', () => {
    expect(doMerge([4, 6, 5], [8], {afterId: 6})).toEqual([4, 6, 8, 5]);
});

test('reverse merge: just prepend', () => {
    expect(doMerge([4, 6, 5, 7, 9], [8, 13, 77],
        {
            reverse: true
        })
    ).toEqual([77, 13, 8, 4, 6, 5, 7, 9]);
});

test('reverse merge: prepend after', () => {
    expect(doMerge([4, 6, 5, 7, 9], [8, 13, 77],
        {
            reverse: true,
            beforeId: 5
        })
    ).toEqual([4, 6, 77, 13, 8, 5, 7, 9]);
});

test('emptying merge', () => {
    expect(doMerge([4], [],
        {
            hasLess: false
        })
    ).toEqual([]);
});

test('same reference: same', () => {
    const target = [4, 6, 5, 7, 9];
    const result = doMerge(target, [4, 6, 5, 7, 9],
        {
            hasLess: false
        });
    expect(result === target).toBeTruthy();
});
test('same reference: add', () => {
    const target = [4, 6, 5, 7, 9];
    const result = doMerge(target, [4, 6, 5, 7, 9, 10],
        {
            hasLess: false
        });
    expect(result === target).toBeFalsy();
    expect(result).toEqual([4, 6, 5, 7, 9, 10]);
});

test('same reference: replace begining', () => {
    const target = [4, 6, 5, 7, 9];
    const result = doMerge(target, [4, 6, 5],
        {
            hasLess: false
        });
    expect(result === target).toBeTruthy();
});

test('test eg 1', () => {
    let target=[{"id":"37e67b05-c86c-4aeb-b3af-bf1c34862cd0","type":"lists"},{"id":"cade87d7-1f28-42c8-a746-7ffb91dfbafa","type":"lists"},{"id":"bb9e6ce7-a5ca-4990-a5b8-944c6d6b2ef3","type":"lists"},{"id":"674d3d77-cf0a-47f7-bb3c-b108f7722f1c","type":"lists"},{"id":"60e0e220-f510-4755-8c49-eb378ea49fd1","type":"lists"},{"id":"40c91ae0-0b50-4c1b-822a-aa2ea5781d4d","type":"lists"},{"id":"eb124127-5ec7-428c-bb7c-1c82f994ddc2","type":"lists"},{"id":"dced00da-ac87-41cc-816a-c520748b9963","type":"lists"},{"id":"ddd1042d-f6c6-4781-b23b-afac2d856f18","type":"lists"},{"id":"1192b487-d44a-44aa-8754-733bc39be945","type":"lists"},{"id":"38bf1b29-0465-42a6-9b4e-9db523452600","type":"lists"},{"id":"3cdcef18-1be3-4a37-8ba5-52dc2c2b8638","type":"lists"},{"id":"37824893-5d63-44cb-bbb5-46c8bc954bb5","type":"lists"},{"id":"d844bafa-e88f-4cd6-9609-28e6c90cce27","type":"lists"},{"id":"197bf8d6-02b1-4ca9-8a82-a8eeb94095b2","type":"lists"},{"id":"96f76154-5c0c-44b8-a4d0-eeb2b0100288","type":"lists"},{"id":"bffaf43b-f32c-424d-bae2-10cdc12fd192","type":"lists"},{"id":"90088e14-262e-4252-8c24-b3fc01f8c99c","type":"lists"},{"id":"3912b4de-0e24-483e-817e-e97048a64062","type":"lists"},{"id":"2a9a54be-6331-4e31-9861-5aed4c9eef97","type":"lists"},{"id":"64bc2539-1f1c-4205-9ae1-80342f21ffe8","type":"lists"},{"id":"944d8a9d-87d1-486b-870c-8fc3f74b52ca","type":"lists"},{"id":"7639dbc8-397d-48c4-b009-88987d161c28","type":"lists"},{"id":"c80ce89a-d5c6-4c11-b19d-5a88ccb02d56","type":"lists"},{"id":"1edf661b-2d41-469c-a439-5358ac10d8ac","type":"lists"},{"id":"8592b366-2bb1-45a9-8eea-83e81fbba6ef","type":"lists"},{"id":"915c547f-6a75-4508-8e2c-9833d4b99803","type":"lists"},{"id":"28c59d66-1b32-449c-a480-5fd1fd5f1753","type":"lists"},{"id":"cbbfe462-07d7-456c-bde2-8c2dd053f3d5","type":"lists"},{"id":"f3d6912e-6c21-4534-9689-6749a06c2b94","type":"lists"}];
    let source=[{"id":"37e67b05-c86c-4aeb-b3af-bf1c34862cd0","type":"lists"},{"id":"cade87d7-1f28-42c8-a746-7ffb91dfbafa","type":"lists"},{"id":"bb9e6ce7-a5ca-4990-a5b8-944c6d6b2ef3","type":"lists"},{"id":"674d3d77-cf0a-47f7-bb3c-b108f7722f1c","type":"lists"},{"id":"60e0e220-f510-4755-8c49-eb378ea49fd1","type":"lists"},{"id":"40c91ae0-0b50-4c1b-822a-aa2ea5781d4d","type":"lists"},{"id":"eb124127-5ec7-428c-bb7c-1c82f994ddc2","type":"lists"},{"id":"dced00da-ac87-41cc-816a-c520748b9963","type":"lists"},{"id":"ddd1042d-f6c6-4781-b23b-afac2d856f18","type":"lists"},{"id":"1192b487-d44a-44aa-8754-733bc39be945","type":"lists"}];
    let result = doMerge(target, source, {keyAccessor: v=>v.id});
    expect(result === target).toBeTruthy();
});

test('test eg 2', () => {
    let target=[{"id":"37e67b05-c86c-4aeb-b3af-bf1c34862cd0","type":"lists"},{"id":"cade87d7-1f28-42c8-a746-7ffb91dfbafa","type":"lists"}];
    let source=[{"id":"37e67b05-c86c-4aeb-b3af-bf1c34862cd0","type":"lists"}];
    let result = doMerge(target, source, {keyAccessor: v=>v.id});
    expect(result).toEqual(target);
    expect(result === target).toBeTruthy();
});



test('has less 1', () => {
    const target = [4, 6, 5, 7, 9];
    const result = doMerge(target, [10, 11, 12],
        {
            hasLess: true
        });
    expect(result).toEqual([4, 6, 5, 7, 9, 10, 11, 12]);
});

test('has less 2', () => {
    const target = [];
    const result = doMerge(target, [10, 11, 12],
        {
            hasLess: true
        });
    expect(result).toEqual([10, 11, 12]);
});
test('has less 3', () => {
    const target = null;
    const result = doMerge(target, [10, 11, 12],
        {
            hasLess: true
        });
    expect(result).toEqual([10, 11, 12]);
});

function doMerge(target, source, options) {

    return mergeLists(target, source, {keyAccessor: v => v, ...options});
}


