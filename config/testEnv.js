const I18nMock = jest.mock('react-native-i18n', () => {
    return {
        // translation passed in here is the
        // string passed inside your template
        // I18n.t('yourObjectProperty')
        t: jest.fn((translation) => {
            // This function is something custom I use to combine all
            // translations into one large object from multiple sources
            // appTranslations is basically just a large object
            // { en: { yourObjectProperty: 'Your Translation' } }
            const appTranslations = combineTranslations(
                TestFormTranslation,
                TestSecondFormTranslation,
            );
            // I use english as the default to return translations to the template.
            // This last line returns the value of your translation
            // by passing in the translation property given to us by the template.
            return appTranslations.en[translation];
        }),
    };
});

global.I18n = I18nMock;

console.debug = console.log;