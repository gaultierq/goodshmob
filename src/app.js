// @flow

import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {Navigation} from 'react-native-navigation';
import * as reducers from "./reducers/allReducers";
import {createWithReducers} from "./auth/reducer";
import thunk from "redux-thunk";
import logger from 'redux-logger'

import * as Api from './managers/Api';
import {autoRehydrate, createTransform, persistStore} from 'redux-persist'
import {Alert, AsyncStorage, Dimensions, StyleSheet, TouchableOpacity} from 'react-native'
import immutableTransform from './immutableTransform'
import {REHYDRATE} from 'redux-persist/constants'
import i18n from './i18n/i18n'
import * as CurrentUser from './managers/CurrentUser'
import {currentUserId} from './managers/CurrentUser'
import {Client} from 'bugsnag-react-native';
import * as globalProps from 'react-native-global-props';
import * as notification from './managers/notification';
import * as DeviceManager from "./managers/DeviceManager";
import * as UI from "./ui/UIStyles";
import {init as initGlobal} from "./global";
import {AlgoliaClient} from "./helpers/AlgoliaUtils";
import {Statistics} from "./managers/Statistics";
import {INIT_CACHE, UPGRADE_CACHE} from "./auth/actionTypes";
import Config from 'react-native-config'
import {Provider} from "react-redux";
import {Messenger} from "./managers/Messenger"
import {Colors} from "./ui/colors";
import {SFP_TEXT_REGULAR} from "./ui/fonts";
import NavManager from "./managers/NavManager";
import Analytics from "./managers/Analytics";
import * as appActions from "./auth/actions";
import OnBoardingManager from "./managers/OnBoardingManager";

console.log(`staring app with env=${JSON.stringify(Config)}`);

initGlobal();

const CACHE_VERSION = 1;

let hydrated = false;

['log', 'debug', 'info', 'warn', 'error'].forEach((level) => {
    if (!(_.includes(Config.ENABLED_LOGS, level))) {
        console[level] = function () {};
    }

});



const appReducer = (state = {}, action) => {
    switch (action.type) {
        case REHYDRATE:
            return {...state, rehydrated: true};
        //return state.merge({rehydrated: true})
    }
    return state;
};

//see the network requests in the debugger
//TODO: doesnt work yet
//GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
//if (!__IS_LOCAL__) {
console.disableYellowBox = true;
//}
const APP_STYLES = StyleSheet.create({
    TEXT_DEFAULT: {
        fontFamily: SFP_TEXT_REGULAR,
        color: Colors.black,
    }
});

//dont know it doesnt work
//const __USE_CACHE_LOCAL__ = false;

type AppMode = 'idle' | 'init_cache' | 'logged' | 'unlogged' | 'upgrading_cache' | 'unknown'

export default class App {

    mode: AppMode = 'idle';

    initialized: boolean; //is app prepared

    store;
    bugsnag;
    cacheVersion: number;

    upgradingCache: boolean = false;


    constructor() {

        this.prepareRedux();

        this.getCurrentCacheVersion().then(cacheVersion => {
            this.cacheVersion = cacheVersion || 0;
        });
        // since react-redux only works on components, we need to subscribe this class manually
        this.store.subscribe(this.onStoreUpdate.bind(this));

        this.start();
    }

    prepareUI() {

        const {height, width} = Dimensions.get('window');
        console.info(`window dimensions=${width}x${height}`);

        globalProps.setCustomText({
            style: APP_STYLES.TEXT_DEFAULT
        });

        globalProps.setCustomView({
            style: {
                backgroundColor: 'transparent'
            }
        });

        globalProps.setCustomTouchableOpacity({
            activeOpacity: 0.8
        });

        // globalProps.setCustomView({
        // backgroundColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.3)`,
        // borderWidth: 1
        // });

        // setCustomTouchableOpacity({
        //     underlayColor: "red"
        // });
        // const DEFAULT_PROPS = {
        //     activeOpacity: 0.85,
        //     underlayColor: 'red',
        // };
        //
        // TouchableOpacity.prototype.getDefaultProps = function getDefaultProps() {
        //     return DEFAULT_PROPS;
        // };
        // Getting rid of that ugly line on Android and adding some custom style to all TextInput components.
        const customTextInputProps = {
            underlineColorAndroid: 'rgba(0,0,0,0)',
            style: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                backgroundColor: 'white'
            }
        };

        globalProps.setCustomTextInput(customTextInputProps);


        // Component.setState.prototype = function setState(imconpleteState, callback) {
        //     console.log("coucouc");
        //     this.setState(imconpleteState, callback);
        // };
    }

    prepareRedux() {
        let allReducers = combineReducers({...reducers, app: appReducer});
        const reducer = createWithReducers(allReducers);
        this.store = createStore(
            reducer,
            window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            compose(
                applyMiddleware(thunk, logger),
                autoRehydrate()
            )
        );

        // begin periodically persisting the store
        let persistConfig = {
            storage: AsyncStorage,
            transforms: [createTransform(immutableTransform.in, immutableTransform.out, immutableTransform.config)],
            // whitelist: ['auth','device']
        };

        if (__USE_CACHE_LOCAL__) {
            console.info(`local cache: enabled -> __USE_CACHE_LOCAL__=${__USE_CACHE_LOCAL__}`);
        } else {
            console.info(`local cache: disabled -> __USE_CACHE_LOCAL__=${__USE_CACHE_LOCAL__}`);
            persistConfig = {...persistConfig, whitelist: ['auth', 'device', 'stat', 'config']};
        }

        persistStore(this.store,
            persistConfig,
            () => {
                console.log("persist store complete");
                hydrated = true;
                //configureApp();
            }
        );
    }

    onStoreUpdate() {
        if (!this.initialized) {
            this.start();
        }

        this.resolveMode();
    }

    start() {
        //waiting rehydration before starting app
        let rehydrated = this.store.getState().app.rehydrated;
        if (!rehydrated) {
            console.debug("waiting for rehydration");
            return;
        }
        if (this.cacheVersion === undefined) {
            console.debug("waiting for cache version");
            return;
        }

        //finish app prepatation
        //singletons
        Api.init(this.store);
        CurrentUser.init(this.store);
        DeviceManager.init(this.store);
        AlgoliaClient.init(this.store);
        Statistics.init(this.store);
        Messenger.init();
        NavManager.init();
        Analytics.init();
        OnBoardingManager.init(this.store);


        if (__WITH_BUGSNAG__) {
            this.bugsnag = new Client();

            console.error = (err) => {
                if (typeof err === 'string') {
                    err = new Error(`Wrapped error: '${err}'` );
                }
                this.bugsnag.notify(err);
            }
        }

        //delayed import
        let registerScreens = require('./ui/allScreens').default;
        registerScreens(this.store, Provider);


        this.prepareUI();
        this.initialized = true;
        console.info("App initialized.");
    }

    resolveMode() {
        let mode: AppMode = 'unknown';

        //invalidate cache if needed
        let cacheVersion = this.cacheVersion;
        if (cacheVersion === undefined) {
            console.debug("waiting for cache version (resolveMode)");
        }


        console.debug(`current cache version=${cacheVersion}, config cache version=${Config.CACHE_VERSION}`);

        if (!cacheVersion) {
            mode = 'init_cache';
        }
        else if (this.upgradingCache  || cacheVersion < Config.CACHE_VERSION) {
            mode = 'upgrading_cache';
        }
        else {
            const {currentUserId} = this.store.getState().auth;
            mode = currentUserId ? 'logged' : 'unlogged';
        }

        //TODO: use navigation to resolve the current screen
        if (this.mode !== mode) {
            let oldMode = this.mode;
            this.mode = mode;

            this.onAppModeChanged(oldMode);
        }
    }

    async getCurrentCacheVersion() {
        return AsyncStorage.getItem('@goodsh:cacheVersion');
    }

    async setCurrentCacheVersion(version: number) {
        this.cacheVersion = version;
        AsyncStorage.setItem('@goodsh:cacheVersion', version);
    }

//type AppMode = 'idle' | 'logged' | 'unlogged' | 'upgrading_cache'

    onAppModeChanged(oldMode: AppMode) {

        console.debug(`mode changed: new mode=${this.mode} (old mode=${oldMode})`);

        const testScreen = require("./testScreen").default;
        let navigatorStyle = {...UI.NavStyles};

        const cacheVersion = Config.CACHE_VERSION;
        switch (this.mode) {
            case 'idle':
                break;
            case 'logged':
                if (__IS_LOCAL__ && testScreen) {
                    Object.assign(testScreen.screen, {navigatorStyle});
                    Navigation.startSingleScreenApp(testScreen);
                }
                else {
                    notification.load();
                    if (this.bugsnag) {
                        //let {id, email, firstName, lastName} = currentUser();
                        // this.bugsnag.setUser(id, firstName + " " + lastName, email);
                        this.bugsnag.setUser(currentUserId(), '', '');
                    }
                    this.startLogged(navigatorStyle);
                }
                break;
            case 'unlogged':
                //TODO: notification => stop listening
                if (this.bugsnag) {
                    this.bugsnag.clearUser();
                }
                this.startUnlogged(navigatorStyle);
                break;
            case 'init_cache':
                this.store.dispatch({type: INIT_CACHE, newCacheVersion: cacheVersion});
                this.setCurrentCacheVersion(cacheVersion);
                break;
            case 'upgrading_cache':
                this.upgradingCache = true;
                this.store.dispatch({type: UPGRADE_CACHE, newCacheVersion: cacheVersion});
                this.setCurrentCacheVersion(cacheVersion);
                this.store.dispatch(appActions.me()).then(() => {
                    this.upgradingCache = false;
                    this.resolveMode()
                });

                //TODO: move to messenger
                Alert.alert(
                    i18n.t("app.update.title"),
                    i18n.t("app.update.label"),
                    [],
                    { cancelable: false }
                );
                break;
        }
    }

    startLogged(navigatorStyle) {
        let userId = CurrentUser.currentUserId();
        if (!userId) throw "wtf";

        let tabsStyle = { // optional, add this if you want to style the tab bar beyond the defaults
            tabBarButtonColor: Colors.black, // optional, change the color of the tab icons and text (also unselected)
            tabBarSelectedButtonColor: Colors.green, // optional, change the color of the selected tab icon and text (only selected)
            tabBarBackgroundColor: 'white',
            forceTitlesDisplay: false,
            initialTabIndex: 0,
        };
        let iconInsets = { // add this to change icon position (optional, iOS only).
            top: 6, // optional, default is 0.
            left: 0, // optional, default is 0.
            bottom: -6, // optional, default is 0.
            right: 0 // optional, default is 0.
        };

        Navigation.startTabBasedApp({
            tabs: [
                {
                    //label: i18n.t('tabs.home.label'),
                    screen: 'goodsh.HomeScreen',
                    icon: require('./img2/mystuff_Glyph.png'),
                    selectedIcon: require('./img2/mystuff_Glyph_Active.png'),
                    // titleImage: require('./img2/headerLogoBlack.png'),
                    title: i18n.t('tabs.home.title'),
                    navigatorStyle,
                    iconInsets
                },
                {
                    //label: i18n.t('tabs.network.label'), // tab label as appears under the icon in iOS (optional)
                    screen: 'goodsh.NetworkScreen', // unique ID registered with Navigation.registerScreen
                    icon: require('./img2/feed_Glyph.png'),
                    selectedIcon: require('./img2/feed_Glyph_Pressed.png'),
                    // titleImage: require('./img2/headerLogoBlack.png'),
                    title: i18n.t('tabs.network.title'), // title of the screen as appears in the nav bar (optional)
                    navigatorStyle,
                    iconInsets
                },
            ],
            tabsStyle,
            appStyle: {
                orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                // bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                // bottomTabBadgeBackgroundColor: 'green', // Optional, change badge background color. Android only
                backButtonImage: require('./img2/leftBackArrowGrey.png'),
                hideBackButtonTitle: true,
                ...navigatorStyle, //added when showing modals, on ios
                ...tabsStyle,
            },
            // passProps: {
            //     drawerRight: {
            //         onScreen: true,
            //         style: {marginTop: 38},
            //     }
            // },
            drawer: { // optional, add this if you want a side menu drawer in your app
                left: { // optional, define if you want a drawer from the left
                    // screen: 'goodsh.FriendsScreen',
                    screen: 'goodsh.ProfileScreen', // unique ID registered with Navigation.registerScreen
                    enabled: false,
                    passProps: {
                        userId
                    } // simple serializable object that will pass as props to all top screens (optional)
                },
                // right: { // optional, define if you want a drawer from the right
                //     screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
                //     // enabled: false,
                //     passProps: {
                //         style: {marginTop: 38},
                //         onScreen: true //with current RNN version there are no way to detect if drawer is opened yet
                //     } // simple serializable object that will pass as props to all top screens (optional)
                // },
                style: { // ( iOS only )
                    drawerShadow: false, // optional, add this if you want a side menu drawer shadow
                    contentOverlayColor: 'rgba(0,0,0,0.15)', // optional, add this if you want a overlay color when drawer is open
                    leftDrawerWidth: 90, // optional, add this if you want a define left drawer width (50=percent)
                    rightDrawerWidth: 90 // optional, add this if you want a define right drawer width (50=percent)
                },
                type: 'TheSideBar', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
                animationType: 'slide-and-scale', //optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
                // for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
                // disableOpenGesture: true// optional, can the drawer be opened with a swipe instead of button
            },
            passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
            //animationType: 'slide-down' // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
        });
    }

    startUnlogged(navigatorStyle) {
        Navigation.startSingleScreenApp({
            screen: {
                label: 'Login',
                screen: 'goodsh.LoginScreen',
                navigatorStyle: {
                    ...navigatorStyle,
                    navBarHidden: true,
                }
            }
        });
    }
}
