import I18n from 'react-native-i18n'
import en from './locales/en'
import fr from './locales/fr'

I18n.fallbacks = true;

I18n.translations = {
    en,
    fr
};
var old = I18n.missingTranslation;

I18n.missingTranslation = function(scope, options) {
    console.error("missing locale:" , [scope,options]);
    return old.apply(I18n, [scope, options])
};

module.exports = I18n;