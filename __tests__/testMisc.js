import * as Time from "../src/utils/TimeUtils"

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


