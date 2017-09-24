import * as Util from "../../src/utils/ModelUtils"
import * as Models from "../../src/models"
import Immutable from 'seamless-immutable';
import * as Api from "../../src/utils/Api";
import util from 'util'

import normalize from 'json-api-normalizer';
import build from 'redux-object';

let logObject = function (result2) {
    console.log(util.inspect(result2, false, null));
};
test('testing activities_fixtures', () => {
    //let result = Util.parse(require("./activities_fixtures2.json"));
    let result = parse(require("./activities_fixtures.json"), "./activities_fixtures.json");

    //console.log(`logging it: ${JSON.stringify(Object.assign({}, result))}`);
    console.log(`logging it:`);
    logObject(result);

    //console.log(JSON.stringify(normalized));

    expect(result).toBeDefined();

    let sending: Models.Sending = result[0];
    //expect(sending).toBeInstanceOf(Models.Sending);

    expect(sending.user).toBeDefined();
    //expect(sending.user).toBeInstanceOf(Models.User);
    expect(sending.user.email).toBe("foobar_80@example.com");
    expect(sending.createdAt).toBe("2017-08-08T16:07:05.734Z");
});


test('testing activities_fixtures2', () => {
    //let result = Util.parse(require("./activities_fixtures2.json"));
    let result = parse(require("./activities_fixtures2.json"), "./activities_fixtures2.json");

    expect(result).toBeDefined();

    let savings: Models.Saving = result[0];
    //expect(savings).toBeInstanceOf(Models.Saving);
    let resource: Models.Place = savings.resource;
    //expect(resource).toBeInstanceOf(Models.Place);
    expect(resource.image).toBe("https://lh3.googleusercontent.com/p/AF1QipM_mxiOMo3vYOLIsvfKqcvjdWvYN_skmCAirsR9=s1600-w600");

});

//immutable is broken
// test('testing immutable', () => {
//     // let result = Util.parse(require("./activities_fixtures.json"));
//     let result = parse(require("./activities_fixtures.json"), "./activities_fixtures.json");
//     console.log(`logging it: ${JSON.stringify(Object.assign({}, result))}`);
//
//     expect(result).toBeDefined();
//
//
//     //expect(sending).toBeInstanceOf(Models.Sending);
//
//
//     let doTests = s => {
//
//         //logObject(s);
//         console.log(JSON.stringify(s));
//         u = s.user;
//         logObject(u);
//         expect(u).toBeDefined();
//         expect(u.firstName).toBe("Foo_75");
//         expect(u.lastName).toBe("Bar_75");
//         expect(Models.User.fullname(u)).toBe("Foo_75 Bar_75");
//     };
//     let sending: Models.Sending = result[0];
//
//     console.log("======mutable");
//     doTests(sending);
//     console.log("======immutable");
//     let immutable = new Immutable(sending);
//
//
//     doTests(immutable);
//
// });

test('testing pagination', () => {
    // let result1 = Util.parse(require("./activities_fixtures.json"));
    // let result2 = Util.parse(require("./activities_fixtures2.json"));
    let result1 = [{id: 13}, {id: 14}];
    let result2 = [{id: 100}, {id: 120}];


    let currentState = Immutable(result1);
    let nextState = Immutable.merge(currentState, result2);

    console.log("next State: " + JSON.stringify(nextState));
});


test('testing meta', () => {
    //let result = Util.parse(require("./activities_fixtures2.json"));
    let result = parse(require("./activities_fixtures2.json"), "./activities_fixtures2.json");
    let post: Models.Post = result[1];
    //expect(post).toBeInstanceOf(Models.Post);
    expect(post.meta).toBeDefined();
    expect(post.meta["comments-count"]).toBe(6);
});

function parse(response, fixtureFile) {
    let normalized = normalize(response,{ endpoint: fixtureFile });
    console.log("=====normalized")
    logObject(normalized);

    let meta = normalized.meta[fixtureFile].data;
    let result;
    if (meta instanceof Array) {
        result = (meta || []).map(object => build(normalized, object.type, object.id));
    }
    else {
        result = build(normalized, meta.type, meta.id)
    }
    console.log("=====result")
    logObject(result);
    return result;

}
