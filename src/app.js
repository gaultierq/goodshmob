// @flow

import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {Navigation} from 'react-native-navigation';
import * as reducers from "./reducers/allReducers";
import {createWithReducers} from "./auth/reducer";
import thunk from "redux-thunk";

import * as Api from './managers/Api';
import {autoRehydrate, createTransform, persistStore} from 'redux-persist'
import {Alert, AsyncStorage, Dimensions, StyleSheet, TouchableOpacity} from 'react-native'
import immutableTransform from './immutableTransform'
import {REHYDRATE} from 'redux-persist/constants'
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


type AppMode = 'idle' | 'init_cache' | 'logged' | 'unlogged' | 'upgrading_cache' | 'unknown'


export default class App {

    mode: AppMode = 'idle';

    initialized: boolean; //is app prepared
    initializing: boolean; //is app initializing

    store;
    bugsnag; //move to some manager
    cacheVersion: number;

    upgradingCache: boolean = false;

    hydrated: boolean;


    constructor() {
        this.spawn();

        //when store is ready
        this.initialize();
    }

    spawn() {

        console.log(`spawning app with env=${JSON.stringify(Config)}`);

        if (module && module.hot) {
            global.reloads = 0;
            // module.hot.accept(() => {
            //     ++global.reloads;
            //     console.info(`hot reload (#${global.reloads})`);
            // });
        }

        initGlobal(false);

        //this.hydrated = false;

        ['log', 'debug', 'info', 'warn', 'error'].forEach((level) => {
            if (!(_.includes(Config.ENABLED_LOGS, level))) {
                console[level] = function () {};
            }
        });

        //see the network requests in the debugger
        //TODO: doesnt work yet
        //GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
        console.disableYellowBox = true;
        //dont know it doesnt work
        //const __USE_CACHE_LOCAL__ = false;

        this.prepareRedux();
    };

    prepareUI() {

        const {height, width} = Dimensions.get('window');
        console.info(`window dimensions=${width}x${height}`);


        globalProps.setCustomText({
            style: {
                fontFamily: SFP_TEXT_REGULAR,
                color: Colors.black,
            }
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
                // paddingVertical: 5,
                // paddingHorizontal: 8,
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

        const appReducer = (state = {}, action) => {
            switch (action.type) {
                case REHYDRATE:
                    return {...state, rehydrated: true};
                //return state.merge({rehydrated: true})
            }
            return state;
        };

        let allReducers = combineReducers({...reducers, app: appReducer});
        const reducer = createWithReducers(allReducers);
        this.store = createStore(
            reducer,
            window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            compose(
                applyMiddleware(thunk/*, logger*/),
                autoRehydrate()
            )
        );

        // begin periodically persisting the store
        let persistConfig = {
            storage: AsyncStorage,
            transforms: [createTransform(immutableTransform.in, immutableTransform.out, immutableTransform.config)],
            // whitelist: ['auth','device']
        };

        if (!__USE_CACHE_LOCAL__) {
            persistConfig = {...persistConfig, whitelist: ['auth', 'device', 'stat', 'config']};
        }

        persistStore(this.store,
            persistConfig,
            () => {
                console.log("persist store complete");
                this.hydrated = true;
                //configureApp();
            }
        );

        this.getCurrentCacheVersion().then(cacheVersion => {
            this.cacheVersion = cacheVersion || 0;
        });
        // since react-redux only works on components, we need to subscribe this class manually
        this.store.subscribe(this.onStoreUpdate.bind(this));
    }

    onStoreUpdate() {
        if (this.initializing) return;

        if (!this.initialized) {
            this.initialize();
        }


        this.refreshAppMode();
    }

    initialize() {
        if (this.initializing) {
            console.debug("app already initializing");
            return;
        }
        if (this.initialized) {
            console.debug("app already initialized");
            return;
        }
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
        console.debug("== app init ==");
        this.initializing = true;


        //managers init rely on a ready store
        //singletons

        CurrentUser.init(this.store);
        DeviceManager.init(this.store);
        AlgoliaClient.init(this.store);
        Statistics.init(this.store);
        Messenger.init();
        NavManager.init();
        Analytics.init();
        OnBoardingManager.init(this.store);

        //api in the end: we dont want to make any call during the app init
        Api.init(this.store);


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

        console.info("== app initialized ==");

        this.initialized = true;
        this.initializing = false;
    }

    refreshAppMode() {
        let mode: AppMode = 'unknown';

        //invalidate cache if needed
        let cacheVersion = this.cacheVersion;
        if (cacheVersion === undefined) {
            console.debug("waiting for cache version (resolveMode)");
        }
        //console.debug(`current cache version=${cacheVersion}, config cache version=${Config.CACHE_VERSION}`);

        if (!cacheVersion) {
            mode = 'init_cache';
        }
        else if (this.upgradingCache  || cacheVersion < __CACHE_VERSION__) {
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
        AsyncStorage.setItem('@goodsh:cacheVersion', ""+version);
    }

//type AppMode = 'idle' | 'logged' | 'unlogged' | 'upgrading_cache'

    onAppModeChanged(oldMode: AppMode) {

        console.debug(`mode changed: new mode=${this.mode} (old mode=${oldMode})`);

        let testScreen;

        if (__TEST_SCREEN__) {
            testScreen = require("./testScreen")[__TEST_SCREEN__];
            if (!testScreen) {
                console.warn(`test screen not found${__TEST_SCREEN__}`);
            }
        }
        let navigatorStyle = {...UI.NavStyles};

        const cacheVersion = __CACHE_VERSION__;
        switch (this.mode) {
            case 'idle':
                break;
            case 'logged':
                if (testScreen) {
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
                    DeviceManager.checkAndSendDiff();

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
                this.refreshAppMode();
                break;
            case 'upgrading_cache':

                //TODO: move to messenger
                Alert.alert(
                    i18n.t("app.update.title"),
                    i18n.t("app.update.label"),
                    [],
                    { cancelable: false }
                );

                this.upgradingCache = true;
                this.store.dispatch({type: UPGRADE_CACHE, newCacheVersion: cacheVersion});
                this.setCurrentCacheVersion(cacheVersion);
                this.store.dispatch(appActions.me()).then(() => {
                    this.upgradingCache = false;
                    this.refreshAppMode()
                });


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
                    screen: 'goodsh.HomeScreen',
                    icon: require('./img2/mystuff_Glyph.png'),
                    selectedIcon: require('./img2/mystuff_Glyph_Active.png'),
                    title: i18n.t('tabs.home.title'),
                    navigatorStyle: [navigatorStyle],
                    iconInsets
                },
                {
                    screen: 'goodsh.NetworkScreen', // unique ID registered with Navigation.registerScreen
                    icon: require('./img2/feed_Glyph.png'),
                    selectedIcon: require('./img2/feed_Glyph_Pressed.png'),
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
