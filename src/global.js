/* @flow */

import * as __ from "lodash";
import _i18n from './i18n/i18n'
import Config from 'react-native-config'
import {superLog as _superLog} from './helpers/DebugUtils'

import {
    Platform,
} from 'react-native';

declare var i18n: any;
declare var _: any;
declare var superConsole: any;
declare var ENABLE_PERF_OPTIM: boolean;
declare var ensureNotNull: () => void;

export function init() {
    global._ = __;
    global.i18n = _i18n;
    global.superLog = _superLog;
    global.ENABLE_PERF_OPTIM = true;
    // global.ENABLE_PERF_OPTIM = false;
    global.__DEBUG_PERFS__ = false;
    // global.__DEBUG_PERFS__ = true;
    global.__IS_LOCAL__= Config.ENV === 'LOCAL';
    global.__IS_PROD__= Config.ENV === 'PROD';
    global.__IS_DEV__= Config.ENV === 'DEV';

    global.__IS_IOS__ = Platform.OS === 'ios';


    global.ensureNotNull = (object) => {
        if (typeof object === 'undefined') {
            throw "unexpected null object"
        }
    }


    if (!__IS_LOCAL__) {
        let _void = function(){};
        console.log = console.debug = console.info = console.warn = console.error = _void;
    }

}