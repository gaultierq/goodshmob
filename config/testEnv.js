//import * as Api from "../src/utils/Api";

let makeI18nPlease = function () {
    const i18njs = require('i18n-js')
    const en = require('../src/i18n/locales/en')
    i18njs.translations = {en} // Optional ('en' is the default)

    //console.log("translations: ", i18njs.translations);

    return {
        t: jest.fn((k, o) => i18njs.t("default." + k, o)),
    }
}
const I18nMock = jest.mock('react-native-i18n', () => {
    return makeI18nPlease()
});

//Api.init(null);

global.I18n = I18nMock;

global.i18n = makeI18nPlease()

console.debug = console.log;

jest.mock('react-native-cached-image', () => {
    return {
        DocumentDir: () => {},
        ImageCache: {
            get: {
                clear: () => {}
            }
        }
    }
});


jest.mock('react-native-snackbar', () => {
    return {
        LENGTH_LONG: 0,
    }
});
