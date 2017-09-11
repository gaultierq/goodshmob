import * as Util from "../../src/model/Util"
import Sending from "../../src/model/Sending"

test('testing parse method', () => {
    //expect(sum(1, 2)).toBe(3);
    let result = Util.parse(require("./activities_fixtures.json"));

    expect(result).toBeDefined();

    let sending = result[0];
    expect(sending).toBeInstanceOf(Sending);
});