import * as ModelUtils from "../src/utils/ModelUtils"
import type {MergeOptions} from "../src/utils/ModelUtils";
import {mergeLists} from "../src/utils/ModelUtils";

test('testing merge 1', () => {
    expect(
        doMerge([4, 6, 5, 7, 9, 12, 77, 1], [7, 12, 77], {afterId: `5`, hasMore: false}))
        .toEqual([4, 6, 5, 7, 12, 77]);
});



