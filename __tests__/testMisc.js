import * as Time from "../src/helpers/TimeUtils"
import * as Api from "../src/managers/Api";

test('testing times', () => {

    expect(
        Time.timeSince(
            Date.parse("2017-08-31T03:54:22.112Z"),
            Date.parse("2017-08-31T03:55:22.112Z"))
    ).toBe("1 minute ago");

    expect(
        Time.timeSince(
            Date.parse("2017-08-31T03:54:22.112Z"),
            Date.parse("2017-08-31T03:58:22.112Z"))
    ).toBe("4 minutes ago");

});


test('testing api query', () => {

    let call = new Api.Call()
        .withRoute("lists")
        .withMethod('GET')
    call.addQuery({fun: "fact"});

    let checkQuery = (expected) => {
        let url: String = call.buildUrl();
        let query = url.substr(url.indexOf("?") + 1);
        expect(query).toBe(expected);
    };

    checkQuery("fun=fact");
    call.addQuery({john: "doe"});
    checkQuery("fun=fact&john=doe");
});



