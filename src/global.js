/* @flow */

import * as _ from "lodash";
import  i18n from './i18n/i18n'
import Config from 'react-native-config'

export function init() {
    global._ = _;
    global.i18n = i18n;
    global.__IS_LOCAL__= Config.ENV === 'LOCAL'
    global.__IS_PROD__= Config.ENV === 'PROD'
    global.__IS_DEV__= Config.ENV === 'DEV'
}