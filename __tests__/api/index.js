import * as Util from "../../src/utils/ModelUtils"
import * as Models from "../../src/model"

test('testing activities_fixtures', () => {
    let result = Util.parse(require("./activities_fixtures.json"));
    console.log(`logging it: ${JSON.stringify(Object.assign({}, result))}`);

    expect(result).toBeDefined();

    let sending: Models.Sending = result[0];
    expect(sending).toBeInstanceOf(Models.Sending);

    expect(sending.user).toBeDefined();
    expect(sending.user).toBeInstanceOf(Models.User);
    expect(sending.user.email).toBe("foobar_80@example.com");
    expect(sending.createdAt).toBe("2017-08-08T16:07:05.734Z");

});

test('testing activities_fixtures2', () => {
    let result = Util.parse(require("./activities_fixtures2.json"));

    expect(result).toBeDefined();

    let savings: Models.Saving = result[0];
    expect(savings).toBeInstanceOf(Models.Saving);
    let resource: Models.Place = savings.resource;
    expect(resource).toBeInstanceOf(Models.Place);
    expect(resource.image).toBe("https://lh3.googleusercontent.com/p/AF1QipM_mxiOMo3vYOLIsvfKqcvjdWvYN_skmCAirsR9=s1600-w600");

});