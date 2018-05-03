//import * as Api from "../src/utils/Api";

const I18nMock = jest.mock('react-native-i18n', () => {
    const i18njs = require('i18n-js');
    const en = require('../src/i18n/locales/en');
    i18njs.translations = {en}; // Optional ('en' is the default)

    //console.log("translations: ", i18njs.translations);

    return {
        t: jest.fn((k, o) => i18njs.t("default."+k, o)),
    };
});

//Api.init(null);

global.I18n = I18nMock;

console.debug = console.log;

jest.mock('react-native-img-cache', () => {
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