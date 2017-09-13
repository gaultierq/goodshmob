// const I18nMock = jest.mock('react-native-i18n', () => {
//     return {
//         // translation passed in here is the
//         // string passed inside your template
//         // I18n.t('yourObjectProperty')
//         t: jest.fn((translation) => {
//             // This function is something custom I use to combine all
//             // translations into one large object from multiple sources
//             // appTranslations is basically just a large object
//             // { en: { yourObjectProperty: 'Your Translation' } }
//             const appTranslations = combineTranslations(
//                 TestFormTranslation,
//                 TestSecondFormTranslation,
//             );
//
//             // I use english as the default to return translations to the template.
//             // This last line returns the value of your translation
//             // by passing in the translation property given to us by the template.
//             return appTranslations.en[translation];
//         }),
//     };
// });

const I18nMock = jest.mock('react-native-i18n', () => {
    const i18njs = require('i18n-js');
    const en = require('../src/i18n/locales/en');
    i18njs.translations = {en}; // Optional ('en' is the default)

    console.log("translations: "+JSON.stringify(i18njs.translations));

    return {
        t: jest.fn((k, o) => i18njs.t("default."+k, o)),
    };
});


global.I18n = I18nMock;

console.debug = console.log;