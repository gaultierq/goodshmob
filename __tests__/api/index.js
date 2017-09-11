import * as Util from "../../src/model/Util"
import * as Models from "../../src/model"

test('testing activities_fixtures', () => {
    let result = Util.parse(require("./activities_fixtures.json"));

    expect(result).toBeDefined();

    let sending: Models.Sending = result[0];
    expect(sending).toBeInstanceOf(Models.Sending);

    expect(sending.user).toBeDefined();
    expect(sending.user).toBeInstanceOf(Models.User);
    expect(sending.user.email).toBe("foobar_80@example.com");

});

test('testing activities_fixtures2', () => {
    let result = Util.parse(require("./activities_fixtures2.json"));

    expect(result).toBeDefined();
});