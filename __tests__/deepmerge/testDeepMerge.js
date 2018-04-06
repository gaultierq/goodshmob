import mymerge1 from "../../src/helpers/DeepMerge"
import merge from 'deepmerge'

const mymerge = (target, source) => mymerge1(target, source, {keyAccessor: a => a});


test('dummy test merge', () => {
    expect(merge({a: 1}, {b: 2})).toEqual({a: 1, b: 2});
});

test('dummy test my merge', () => {
    const target = {a: 1};
    const source = {b: 2};
    const expectedResult = {a: 1, b: 2};

    const merged = mymerge(target, source);

    expect(merged).toEqual(expectedResult);
});

test('test merge 1', () => {
    const target = {a: 1, b: 2};
    const merged = merge(target, {b: 2});

    expect(merged).toEqual(target);
    expect(merged === target).toBeFalsy();
});

test('test my merge 1', () => {
    const target = {a: 1, b: 2};
    const merged = mymerge(target, {b: 2});

    expect(merged).toEqual(target);
    expect(merged === target).toBeTruthy();
});

test('test my merge 2', () => {
    const target = {a: 1, b: 2, c: [3]};
    {
        const merged = mymerge(target, {b: 2});
        expect(merged).toEqual(target);
        expect(merged === target).toBeTruthy();
    }

});

test('test my merge 3', () => {
    const target = {a: 1, b: 2, c: [3]};
    {
        const merged = mymerge(target, {b: 3});
        expect(merged).toEqual({a: 1, b: 3, c: [3]});
        expect(merged === target).toBeFalsy();
    }

});

test('test my merge 4', () => {
    const target = {a: 1, b: 2, c: [3, 4, 5]};
    {
        const merged = mymerge(target, {c: [3, 4, 5, 6]});
        expect(merged).toEqual({a: 1, b: 2, c: [3, 4, 5, 6]});
        expect(merged === target).toBeFalsy();
    }
});
test('test my merge 5', () => {
    const target = {a: 1, b: 2, c: [3, 4, 5]};
    {
        const merged = mymerge(target, {c: [3, 4, 5]});
        expect(merged).toEqual(target);
        expect(merged === target).toBeTruthy();
    }
});


