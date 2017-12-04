/* @flow */

import * as __ from "lodash";
import  _i18n from './i18n/i18n'
import Config from 'react-native-config'

declare var i18n: any;
declare var _: any;

export function init() {
    global._ = __;
    global.i18n = _i18n;
    global.__IS_LOCAL__= Config.ENV === 'LOCAL';
    global.__IS_PROD__= Config.ENV === 'PROD';
    global.__IS_DEV__= Config.ENV === 'DEV';
}