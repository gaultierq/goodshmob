/* @flow */

import * as __ from "lodash";
import _i18n from './i18n/i18n'
import Config from 'react-native-config'
import {superLog as _superLog} from './helpers/DebugUtils'

import {Dimensions, Platform} from 'react-native';


declare var i18n: any;
declare var _: any;
declare var superConsole: any;
declare var ENABLE_PERF_OPTIM: boolean;
declare var ensureNotNull: () => void;


const ALL_KEYS = [
    'ENV',
    'SERVER_URL',
    'ALGOLIA_SAVING_INDEX',
    'ALGOLIA_USER_INDEX',
    'CACHE_VERSION',
    'WITH_FABRIC',
    'USE_CACHE_LOCAL',
    'API_VERSION',
    'WITH_BUGSNAG',
    'HTTP_TIMEOUT',
    'WITH_STATS',
    'ENABLED_LOGS',
    'DEBUG_SHOW_IDS',
    'DEBUG_PERFS',
    'WITH_ASSERTS',
    'TEST_SCREEN',
    'DEBUG_PENDING_DELAY',
    'MIN_REQUEST_TIME',
];

export function init(hotReload: boolean) {
    global._ = __;
    global.i18n = _i18n;
    global.superLog = _superLog;
    global.ENABLE_PERF_OPTIM = true;
    // global.ENABLE_PERF_OPTIM = false;

    global.__ENABLE_BACK_HANDLER__ = false;

    //retry after react-native update !
    // global.__ENABLE_BACK_HANDLER__ = true;
    global.__IS_IOS__ = Platform.OS === 'ios';
    global.__IS_ANDROID__ = Platform.OS === 'android';

    if (!Config.ENV) throw `No .env file found. Try to run 'cp env.local .env && react-native run-${Platform.OS}'`;

    // global.__DEBUG_PERFS__ = false;
    // global.__DEBUG_PERFS__ = true;
    global.__IS_LOCAL__= Config.ENV === 'LOCAL';
    global.__IS_PROD__= Config.ENV === 'PROD';
    global.__IS_DEV__= Config.ENV === 'DEV';

    confToGlobal(Config, true);

    // if (__IS_LOCAL__ && require.resolve('./../env')) {
    //     try {
    //         const config = require('./../env');
    //         confToGlobal(config, false);
    //     }
    //     catch (e) {}
    // }

    let {width, height} = Dimensions.get('window');
    global.__DEVICE_WIDTH__ = width;
    global.__DEVICE_HEIGHT__ = height;


    global.ensureNotNull = (object) => {
        if (typeof object === 'undefined') {
            throw "unexpected null object"
        }
    }
}


let confToGlobal = function (config, throwIfAlreadyDefined) {
    let convert = (value) => {

        let isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (isNumeric(value)) value = _.toNumber(value);
        else if (value === '') value = undefined;
        return value;
    };

    let setGlobalFromConfig = (key, value) => {
        key = `__${_.toUpper(key)}__`;
        if (key in global && throwIfAlreadyDefined && !__IS_LOCAL__) throw `global already defined:${key}`;
        global[key] = convert(value);
    };


    // _.keys(config).forEach(k => {
    ALL_KEYS.forEach(k => {
        setGlobalFromConfig(k, config[k]);
    });
};
