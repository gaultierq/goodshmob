// @flow
/* global ErrorUtils */
import {applyMiddleware, combineReducers, compose, createStore} from "redux"
import {Navigation} from 'react-native-navigation'
import * as reducers from "./reducers/allReducers"
import {createWithReducers} from "./auth/reducer"
import thunk from "redux-thunk"

import * as Api from './managers/Api'
import {autoRehydrate, createTransform, persistStore} from 'redux-persist'
import {Alert, AsyncStorage, Dimensions, Linking, StyleSheet, TouchableOpacity} from 'react-native'
import immutableTransform from './immutableTransform'
import * as CurrentUser from './managers/CurrentUser'
import {currentUser, currentUserId, isLogged} from './managers/CurrentUser'
import * as globalProps from 'react-native-global-props'
import NotificationManager from './managers/NotificationManager'
import * as DeviceManager from "./managers/DeviceManager"
import * as UI from "./ui/UIStyles"
import {AlgoliaClient} from "./helpers/AlgoliaUtils"
import {Statistics} from "./managers/Statistics"
import {CLEAR_CACHE, INIT_CACHE, UPGRADE_CACHE} from "./auth/actionTypes"
import Config from 'react-native-config'
import {Provider} from "react-redux"
import {Messenger} from "./managers/Messenger"
import {Colors} from "./ui/colors"
import {SFP_TEXT_REGULAR} from "./ui/fonts"
import NavManager from "./managers/NavManager"
import Analytics from "./managers/Analytics"
import * as appActions from "./auth/actions"
import OnBoardingManager from "./managers/OnBoardingManager"
import StoreManager from "./managers/StoreManager"
import BugsnagManager from "./managers/BugsnagManager"
import RNAccountKit, {Color,} from 'react-native-facebook-account-kit'
import RNProgressHUB from 'react-native-progresshub'
import {actions as userActions, actionTypes as userActionTypes} from "./redux/UserActions"


type AppMode = 'idle' | 'init_cache' | 'logged' | 'unlogged' | 'upgrading_cache' | 'unknown'
type AppConfig = {
    mode: AppMode,
    hasUser?: boolean,
    userHasVitalInfo?: boolean,
}


export default class App {

    config: AppConfig = {
        mode: 'idle',
    }


    initialized: boolean; //is app prepared
    initializing: boolean; //is app initializing

    store;
    cacheVersion: number;

    upgradingCache: boolean = false;

    hydrated: boolean;

    logger


    constructor() {
        this.spawn();

        //when store is ready
        this.initialize();
    }

    spawn() {
        this.logger = rootlogger.createLogger("app")
        if (module && module.hot) {
            global.reloads = 0;
            // module.hot.accept(() => {
            //     ++global.reloads;
            //     console.info(`hot reload (#${global.reloads})`);
            // });
        }

        //initGlobal(false);
        this.logger.debug(`spawning app with env`, Config);
        //this.hydrated = false;

        //see the network requests in the debugger
        //TODO: doesnt work yet
        //GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
        console.disableYellowBox = true;
        //dont know it doesnt work
        //const __USE_CACHE_LOCAL__ = false;

        this.prepareRedux();

        this.registerScreens();

        //TODO: find a better way of delaying this Linking init
        setTimeout(()=> {
            Linking.addEventListener('url', ({url}) => {
                if (url) this.logger.log('Linking: url event: ', url);
                NavManager.goToDeeplink(url);
            })

            Linking.getInitialURL().then(url => {
                if (url) this.logger.log('Linking:Initial url is: ', url);
                NavManager.goToDeeplink(url);
            }).catch(err => this.logger.error('Linking:An error occurred', err));
        }, 500)
    };

    prepareUI() {

        const {height, width} = Dimensions.get('window');
        this.logger.info(`window dimensions=${width}x${height}`);

        globalProps.setCustomText({
            style: {
                fontFamily: SFP_TEXT_REGULAR,
                color: Colors.black,
            }
        });

        globalProps.setCustomTouchableOpacity({
            activeOpacity: 0.8
        });
    }

    prepareRedux() {

        let allReducers = combineReducers({...reducers/*, app: appReducer*/});
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
                this.logger.log("persist store complete");
                this.hydrated = true;
                //configureApp();
            }
        );

        this.getCurrentCacheVersion().then(cacheVersion => {
            this.cacheVersion = cacheVersion || 0;
            this.logger.info(`cache version=${this.cacheVersion}`);
        });
        // since react-redux only works on components, we need to subscribe this class manually
        // FIXME: we should listen only part of the store, not all dispatchs
        this.store.subscribe(this.onStoreUpdate.bind(this));
    }

    onStoreUpdate() {
        if (this.initializing) return;

        if (!this.initialized) {
            this.initialize();
        }

        this.logger.log('app store update :)');

        setTimeout(() => {
            this.refreshApp();
        });
    }

    initialize() {
        if (this.initializing) {
            this.logger.debug("app already initializing");
            return;
        }
        if (this.initialized) {
            this.logger.debug("app already initialized");
            return;
        }
        //waiting rehydration before starting app
        let rehydrated = this.store.getState().app.rehydrated;
        if (!rehydrated) {
            this.logger.debug("waiting for rehydration");
            return;
        }
        if (this.cacheVersion === undefined) {
            this.logger.debug("waiting for cache version");
            return;
        }
        this.logger.debug("== app init ==");
        this.initializing = true;


        //managers init rely on a ready store
        //singletons


        if (ErrorUtils && Config.SKIP_EMPTY_CACHE_ON_UNHANDLED_ERROR !== 'true') {
            const previousHandler = ErrorUtils.getGlobalHandler();

            ErrorUtils.setGlobalHandler((error, isFatal) => {
                try {
                    this.store.dispatch({type: CLEAR_CACHE});
                }
                finally {
                    previousHandler(error, isFatal)
                }

            })
        }

        StoreManager.init(this.store);
        CurrentUser.init(this.store);
        DeviceManager.init(this.store);
        AlgoliaClient.init(this.store);
        Statistics.init(this.store);
        Messenger.init();
        NavManager.init();
        Analytics.init();
        OnBoardingManager.init(this.store);
        BugsnagManager.init(this.store);

        RNAccountKit.configure({
            theme: {
                // Background
                backgroundColor: Color.hex(Colors.green),
                // Button
                buttonBackgroundColor: Color.hex(Colors.facebookBlue),
                buttonBorderColor: Color.hex(Colors.facebookBlue),
                buttonTextColor: Color.hex(Colors.white),
                // Button disabled
                buttonDisabledBackgroundColor: Color.hex(Colors.greyish),
                buttonDisabledBorderColor: Color.hex(Colors.greyish),
                buttonDisabledTextColor: Color.hex(Colors.white),
                // // Header
                headerBackgroundColor: Color.hex(Colors.green),
                headerButtonTextColor: Color.hex(Colors.white),
                headerTextColor: Color.hex(Colors.white),
                // Others
                iconColor: Color.hex(Colors.white),
                titleColor: Color.hex(Colors.white),
                textColor: Color.hex(Colors.white),
            }})



        //api in the end: we dont want to make any call during the app init
        Api.init(this.store);

        this.prepareUI();

        this.logger.info("== app initialized ==");

        this.initialized = true;
        this.initializing = false;
        this.onAppReady()
    }

    onAppReady() {
        // OnBoardingManager.listenToStepChange({
        //     triggerOnListen: true,
        //     callback: (step?:OnBoardingStep) => {
        //         if (step === 'notification') {
        //             if (isLogged()) {
        //                 let callback = () => {
        //                     OnBoardingManager.onDisplayed('notification')
        //                 }
        //                 NotificationManager.requestPermissionsForLoggedUser()
        //                     .catch(callback)
        //                     .then(callback)
        //             }
        //
        //         }
        //     }
        // })
    }

    registerScreens() {
        //delayed import.
        // => Why ? for perfs ? :D
        let registerScreens = require('./ui/allScreens').default;
        registerScreens(this.store, Provider);

    }

    refreshApp() {
        // let mode: AppMode = 'unknown';
        let config = {}
        //invalidate cache if needed
        let cacheVersion = this.cacheVersion;
        if (cacheVersion === undefined) {
            this.logger.debug("waiting for cache version (resolveMode)");
        }
        //this.logger.debug(`current cache version=${cacheVersion}, config cache version=${Config.CACHE_VERSION}`);

        if (!cacheVersion) {
            config.mode = 'init_cache';
        }
        else if (this.upgradingCache  || cacheVersion < Config.CACHE_VERSION) {
            config.mode = 'upgrading_cache';
        }
        else {
            config.mode = isLogged() ? 'logged' : 'unlogged'
            const user = currentUser()
            if (config.hasUser = user && !user.dummy) {
                config.userHasVitalInfo = !_.isEmpty(user.firstName)  && !_.isEmpty(user.lastName)
            }
        }

        //TODO: use navigation to resolve the current screen
        if (!_.isEqual(this.config, config)) {
            let oldConfig = this.config;
            this.config = config;

            setTimeout(async () => {
                await this.onAppConfigChanged(oldConfig)
            })
        }
    }

    async getCurrentCacheVersion() {
        return AsyncStorage.getItem('@goodsh:cacheVersion');
    }

    async setCurrentCacheVersion(version: number) {
        this.cacheVersion = version;
        AsyncStorage.setItem('@goodsh:cacheVersion', ""+version);
    }

    async onAppConfigChanged(oldConfig: AppConfig) {

        this.logger.debug(`app mode changed: new mode`, this.config, '(old mode', oldConfig,`)`);

        let testScreen;
        let testScreenName = (__IS_IOS__ ? __TEST_SCREEN_IOS__ : __TEST_SCREEN_ANDROID__)
        if (!testScreenName) testScreenName = __TEST_SCREEN__

        if (testScreenName) {
            testScreen = require("./testScreen")[testScreenName];
            if (!testScreen) {
                this.logger.warn(`test screen not found${testScreenName}`);
            }
        }
        let navigatorStyle = {...UI.NavStyles};

        const cacheVersion = Config.CACHE_VERSION;
        switch (this.config.mode) {
            case 'idle':
                break;
            case 'logged':
                let userId = currentUserId()
                if (testScreen) {
                    Object.assign(testScreen.screen, {navigatorStyle});
                    Navigation.startSingleScreenApp(testScreen);
                }
                else {
                    if (!this.config.hasUser) {
                        //load user
                        if (!__IS_ANDROID__) {
                            RNProgressHUB.showSpinIndeterminate()
                        }


                        const action = userActions
                            .getUser(currentUserId())
                            .createActionDispatchee(userActionTypes.GET_USER)

                        this.store.dispatch(action).then(() => {
                            if (!__IS_ANDROID__) {
                                RNProgressHUB.dismiss()
                            }
                        })

                    }
                    else if (!this.config.userHasVitalInfo) {

                        Navigation.startSingleScreenApp({
                            screen: {
                                screen: 'goodsh.EditUserProfileScreen',
                                navigatorStyle: {
                                    ...navigatorStyle,
                                },

                            },
                            passProps: {
                                userId
                            }
                        });

                    }
                    else {
                        //TODO: move
                        await NotificationManager.init()
                        //this probably shouldn't be here
                        //NotificationManager.requestPermissionsForLoggedUser()

                        BugsnagManager.setUser(currentUser());

                        DeviceManager.checkAndSendDiff();

                        this.launchMain(navigatorStyle);
                    }
                }
                break;
            case 'unlogged':
                BugsnagManager.clearUser();

                this.startUnlogged(navigatorStyle);
                break;
            case 'init_cache':
                this.store.dispatch({type: INIT_CACHE, newCacheVersion: cacheVersion});
                this.setCurrentCacheVersion(cacheVersion);
                this.refreshApp();
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
                    this.refreshApp()
                });


                break;
        }
    }

    launchMain(navigatorStyle) {

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
                    navigatorStyle: [navigatorStyle],
                    iconInsets,
                    passProps: {
                        userId: currentUserId()
                    }
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
            //         visible: true,
            //         style: {marginTop: 38},
            //     }
            // },
            drawer: { // optional, add this if you want a side menu drawer in your app
                left: { // optional, define if you want a drawer from the left
                    // screen: 'goodsh.FriendsScreen',
                    screen: 'goodsh.ProfileScreen', // unique ID registered with Navigation.registerScreen
                    enabled: false,
                },
                // right: { // optional, define if you want a drawer from the right
                //     screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
                //     // enabled: false,
                //     passProps: {
                //         style: {marginTop: 38},
                //         visible: true //with current RNN version there are no way to detect if drawer is opened yet
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
                    navigationBarColor: Colors.green,
                    statusBarColor: Colors.green,
                },
            }
        });
    }

}
