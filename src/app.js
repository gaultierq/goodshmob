// @flow

/* global ErrorUtils */
import {applyMiddleware, compose, createStore} from "redux"
import {Navigation} from 'react-native-navigation'
import * as reducers from "./reducers/allReducers"
import {createWithReducers} from "./auth/reducer"
import thunk from "redux-thunk"

import * as Api from './managers/Api'
import {persistCombineReducers, persistStore} from 'redux-persist'
import * as CurrentUser from './managers/CurrentUser'
import {currentUser, currentUserId} from './managers/CurrentUser'
import * as globalProps from 'react-native-global-props'
import NotificationManager from './managers/NotificationManager'
import * as DeviceManager from "./managers/DeviceManager"
import * as UI from "./ui/UIStyles"
import {NAV_BACKGROUND_COLOR} from "./ui/UIStyles"
import {AlgoliaClient} from "./helpers/AlgoliaUtils"
import {Statistics} from "./managers/Statistics"
import {CLEAR_CACHE, SET_CACHE_VERSION} from "./auth/actionTypes"
import Config from 'react-native-config'
import {Provider} from "react-redux"
import {Messenger, sendMessage} from "./managers/Messenger"
import {Colors} from "./ui/colors"
import {SFP_TEXT_REGULAR} from "./ui/fonts"
import NavManager from "./managers/NavManager"
import Analytics from "./managers/Analytics"
import OnBoardingManager from "./managers/OnBoardingManager"
import StoreManager from "./managers/StoreManager"
import BugsnagManager from "./managers/BugsnagManager"
import RNAccountKit, {Color,} from 'react-native-facebook-account-kit'
import RNProgressHUB from 'react-native-progresshub'
import {actions as userActions, actionTypes as userActionTypes} from "./redux/UserActions"
import firebase from 'react-native-firebase'
import {Alert, Text, AsyncStorage, Dimensions, Linking, StyleSheet, TouchableOpacity, ToastAndroid} from 'react-native'
import {NAV_BACKGROUND_COLOR} from "./ui/UIStyles"
import * as Nav from "./ui/Nav"
import Timeout from 'await-timeout'
import type {GLogger} from "../flow-typed/goodshmob"
import {flatDiff, isPositive} from "./helpers/StringUtils"
import watch from "redux-watch"
import type {Id} from "./types"


type AppConfig = {

    currentUserId?: Id,
    userData?: null | 'fetching' | true,
    userWithName?: boolean,


    fetchingCacheVersion?: boolean,
    upgradingCacheVersion?: boolean,

    hydration: 'no' | 'hydrating' | 'hydrated',
    init: 'no' | 'initializing' | 'initialized',
}


export default class App {

    state: AppConfig =  {
        hydration: 'no',
        init: 'no',
        userData: null

    }

    renderedState: any

    //temp hack
    initialLinkFetched = false
    initialLink = null

    store: any
    logger: GLogger


    constructor() {
        this.spawn();
    }


    /**
     * I. cache version:
     *  1. fetch it (async)
     *  2. is it ok with the one from the config, if not clear cache and upgrade version (async)
     * II. redux store
     *  1. create
     *  2. hydrate (async)
     * III. initialize the managers
     * IV. fetch missing info if needed (async)
     */
    async spawn() {

        // I.0
        this.prepareDevEnv()

        this.logger.log('spawning app')


        // II. 1
        if (!this.store) {
            this.store = this.createStore()
        }

        // II. 2
        if (this.state.hydration !== 'hydrated') {
            this.setState({hydration: 'hydrating'})
            await this.hydrateStore()
            this.setState({hydration: 'hydrated'})
        }

        const confCacheV = _.toNumber(Config.CACHE_VERSION)


        let currentCacheVersion = _.get(this.store.getState(), 'app.cacheVersion', -1)
        if (currentCacheVersion < confCacheV) {
            // upgrading cache
            this.setState({upgradingCacheVersion: true})
            this.store.dispatch({type: CLEAR_CACHE})
            this.store.dispatch({type: SET_CACHE_VERSION, cacheVersion: confCacheV})
            this.setState({upgradingCacheVersion: false})
        }


        // III.
        if (this.state.init!== 'initialized') {
            this.setState({init: 'initializing'})
            this.initializeManagers()
            this.setState({init: 'initialized'})
        }



        // IV
        this.logger.info('registering screens')
        let registerScreens = require('./ui/allScreens').default;
        registerScreens(this.store, Provider);

        // V.
        this.listenToUserStoreChanges()
    }

    listenToUserStoreChanges() {
        let userChangeSubscription: ?() => void
        // listening .auth to know if uer is logged.

        this.subAndTrig('auth.currentUserId', (currentUserId, previousCurrentUserId) => {
            //i have a user id, and i m notified of any changes
            this.logger.debug('currentUserId has changed', previousCurrentUserId, ' -> ', currentUserId)


            this.setState({currentUserId})

            // listening for user data changes
            if (currentUserId) {

                userChangeSubscription = this.subAndTrig(
                    `data.users.${currentUserId}`,
                    (user, pu) => {
                        this.logger.debug('userData has changed', pu, ' -> ', user)


                        if (!user) {
                            // I have a half user
                            this.setState({userData: 'fetching'})

                            const action = userActions
                                .getUser(currentUserId).force()
                                .createActionDispatchee(userActionTypes.GET_USER)

                            this.store.dispatch(action)
                        }
                        else {
                            // I have a full user
                            this.setState({userData: true})
                            BugsnagManager.setUser(user.attributes)
                        }

                        //logged user has changed
                        this.setState({userWithName: this.userHasVitalInfo(user)})


                    })
            }
            else {
                // don't have a user here
                if (userChangeSubscription) userChangeSubscription()
                this.setState({userData: null, userWithName: false})
                BugsnagManager.clearUser()
            }
        })
    }

    listeToUserStoreChanges() {
        let userChangeSubscription: ?() => void
        // listening .auth to know if uer is logged.

        this.subAndTrig('auth.currentUserId', (currentUserId, previousCurrentUserId) => {
            this.logger.debug('currentUserId has changed', previousCurrentUserId, ' -> ', currentUserId)


            this.setState({currentUserId})

            // listening for user data changes
            if (currentUserId) {

                userChangeSubscription = this.subAndTrig(
                    `data.users.${currentUserId}`,
                    (user, pu) => {
                        this.logger.debug('userData has changed', pu, ' -> ', user)
                        //logged user has changed
                        this.setState(
                            {
                                userData: !!user,
                                userWithName: this.userHasVitalInfo(user)
                            }
                        )
                    })
            }
            else {
                if (userChangeSubscription) userChangeSubscription()
                this.setState({userData: null, userWithName: false})
            }
        })
    }

    subAndTrig(path, callback) {
        let fun = this.store.subscribe(watch(this.store.getState, path)(callback))
        let initObj = _.get(this.store.getState(), path)
        callback(initObj)
        return fun
    }

    watcher(path: string) {
        return watch(this.store.getState, path)
    }

    prepareUI() {

        const {height, width} = Dimensions.get('window');
        this.logger.info(`window dimensions=${width}x${height}`);

        // globalProps.setCustomText({
        //     style: {
        //         fontFamily: SFP_TEXT_REGULAR,
        //         color: Colors.black,
        //     }
        // })
        if (Text.defaultProps == null) Text.defaultProps = {};
        Text.defaultProps.style  = {
            fontFamily: SFP_TEXT_REGULAR,
            color: Colors.black
        }

        // globalProps.setCustomTouchableOpacity({
        //     activeOpacity: 0.8
        // });
    }

    async hydrateStore() {
        return new Promise((resolve, reject) => {
            persistStore(
                this.store,
                null,
                () => {
                    this.logger.log("store hydrated")
                    resolve()
                }
            )
        })
    }

    createStore() {
// begin periodically persisting the store
        let persistConfig = {
            key: 'primary',
            storage: AsyncStorage,
            // transforms: [createTransform(immutableTransform.in, immutableTransform.out, immutableTransform.config)],
            // whitelist: ['auth','device']
        }

        if (Config.USE_CACHE_LOCAL === "mix") {
            persistConfig = {...persistConfig, whitelist: ['auth', 'device', 'stat', 'config']}
        }


        let allReducers = persistCombineReducers(persistConfig, {...reducers/*, app: appReducer*/})
        const reducer = createWithReducers(allReducers)

        return createStore(
            reducer,
            window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            compose(
                applyMiddleware(thunk/*, logger*/),
                // autoRehydrate()
            )
        )
    }


    prepareDevEnv() {
        this.logger = rootlogger.createLogger("app")
        this.logger.debug(`spawning app with env`, Config);

        if (module && module.hot) {
            global.reloads = 0;
        }

        console.disableYellowBox = true

        // $FlowFixMe
        if (ErrorUtils && Config.SKIP_EMPTY_CACHE_ON_UNHANDLED_ERROR !== 'true') {
            const previousHandler = ErrorUtils.getGlobalHandler();

            ErrorUtils.setGlobalHandler((error, isFatal) => {
                this.logger.error("caught error", error)
                try {
                    this.store.dispatch({type: CLEAR_CACHE});
                }
                finally {
                    previousHandler(error, isFatal)
                }

            })
        }
    }

    async setState(statePart: any) {
        return new Promise((resolve, reject) => {
            this.state = {...this.state, ...statePart}
            this.logger.debug('new state', this.state)

            resolve()

            setTimeout(async () => {

                let diff = flatDiff(this.renderedState || {}, this.state)
                if (!_.isEmpty(diff)) {
                    this.logger.debug('refreshing', diff)
                    this.renderedState = this.state
                    await this.refresh()
                }
                else {
                    this.logger.debug('refresh saved')
                }

            })
        })

    }

    // getting the singleton ready.
    initializeManagers() {

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

        firebase.links().onLink((url) => {
            this.logger.info("dynamic links: onLink", url)
        });



        //api in the end: we don't want to make any request during the app init
        Api.init(this.store);

        this.prepareUI();
    }

    registerScreens() {
        //delayed import.
        // => Why ? for perfs ? :D
        let registerScreens = require('./ui/allScreens').default;
        registerScreens(this.store, Provider);

    }

    userHasVitalInfo(user: any) {
        let fn = _.get(user, 'attributes.firstName')
        let ln = _.get(user, 'attributes.lastName')
        return !_.isEmpty(fn) && !_.isEmpty(ln)
    }

    async readCurrentCacheVersion() {
        return AsyncStorage.getItem('@goodsh:cacheVersion');
    }

    async writeCurrentCacheVersion(version: number) {
        this.logger.debug('writing to cache', version)
        AsyncStorage.setItem('@goodsh:cacheVersion', ""+version);
        this.logger.debug('writed to cache', version)
    }

    async obtainInitialLink() {
        // if (this.initialLinkFetched) return this.initialLink
        // this.initialLinkFetched = true
        this.logger.debug("obtaining InitialLink")
        const promise = firebase.links().getInitialLink()
        try {
            return await Timeout.wrap(promise, 500, 'Timeout while obtaining initial link');
        }
        catch(err) {
            console.warn(err)
            return null
        }
        finally {
            this.logger.debug("InitialLink obtained")
        }

        // return await firebase.links().getInitialLink()
    }

    async refresh() {

        //does it make any sense ?
        if (this.state.init !== 'initialized') {
            this.logger.debug("refresh: app not init yet")
            return
        }
        let testScreen = this.getTestScreen()
        //TODO: move me
        let url = await this.obtainInitialLink()


        if (url) {
            this.logger.info("dynamic link", url)
            sendMessage(`to see your content, please log in ${url}`, {timeout: 60000})
        }

        const cui = this.state.currentUserId
        if (cui) {
            if (testScreen) {
                Object.assign(testScreen.screen, {navigatorStyle: UI.NavStyles});
                Navigation.startSingleScreenApp(testScreen);
            }
            else {
                const userData = this.state.userData
                if (userData === 'fetching') {
                    //loading user
                    if (!__IS_ANDROID__) RNProgressHUB.showSpinIndeterminate()
                    return
                }
                else if (userData === true) {
                    if (!__IS_ANDROID__) RNProgressHUB.dismiss()
                }

                if (this.state.userWithName === false) {


                    Navigation.startSingleScreenApp({
                        screen: {
                            screen: 'goodsh.EditUserProfileScreen',
                            navigatorStyle: UI.NavStyles,

                        },
                        passProps: {
                            userId: cui
                        }
                    });

                }
                else {
                    //TODO: move
                    await NotificationManager.init()

                    DeviceManager.checkAndSendDiff();

                    //TODO: find a better way of delaying this Linking init
                    this.logger.log('booting posting main callback')
                    setTimeout(async ()=> {
                        this.logger.log('booting main callback')

                        Linking.addEventListener('url', ({url}) => {
                            if (url) this.logger.log('Linking: url event: ', url);
                            NavManager.goToDeeplink(url);
                        })
                        let initialUrl = await Linking.getInitialURL()
                        let initialLink = await this.obtainInitialLink()

                        this.logger.debug("deeplinking input: ", initialUrl, initialLink)

                        this.launchMain(initialUrl || initialLink)

                    }, 500)

                    //this.launchMain(navigatorStyle);
                }
            }
        }
        else {
            this.startUnlogged();
        }
    }

    getTestScreen() {
        let testScreen
        let testScreenName = (__IS_IOS__ ? __TEST_SCREEN_IOS__ : __TEST_SCREEN_ANDROID__)
        if (!testScreenName) testScreenName = __TEST_SCREEN__

        if (testScreenName) {
            testScreen = require("./testScreen")[testScreenName]
            if (!testScreen) {
                this.logger.warn(`test screen not found${testScreenName}`)
            }
        }
        return testScreen
    }

    launchMain(initialLink?: string) {

        // NavManager.goToDeeplink(initialLink)
        let parseDeeplink = NavManager.parseDeeplink(initialLink)
        let {tab, modal} = parseDeeplink

        this.logger.debug("launching main: ", initialLink, parseDeeplink)


        let iconInsets = { // add this to change icon position (optional, iOS only).
            top: 6, // optional, default is 0.
            left: 0, // optional, default is 0.
            bottom: -6, // optional, default is 0.
            right: 0 // optional, default is 0.
        }

        const TABS = [
            {
                screen: 'goodsh.HomeScreen',
                icon: require('./img2/home.png'),
                selectedIcon: require('./img2/home-active.png'),
                navigatorStyle: UI.NavStyles,
                iconInsets,
                passProps: {
                    userId: currentUserId(),
                }
            },
            {
                screen: 'goodsh.CategorySearchScreen',
                icon: require('./img2/search.png'),
                selectedIcon: require('./img2/searchActive.png'),
                title: i18n.t('tabs.category_search.title'),
                navigatorStyle: UI.NavStyles,
                iconInsets,
                passProps: {
                    userId: currentUserId()
                }
            },
            {
                screen: 'goodsh.NetworkScreen', // unique ID registered with Navigation.registerScreen
                icon: require('./img2/feed.png'),
                selectedIcon: require('./img2/feed-active.png'),
                title: i18n.t('tabs.network.title'),
                navigatorStyle: UI.NavStyles,
                iconInsets
            },
        ]

        const tabs = [...TABS]

        let tabScreen = _.get(tab, 'screen')
        let initialTabIndex = 0
        if (tabScreen) {
            let i = TABS.length
            for (; --i > 0; ) {
                if (tabs[i].screen === tabScreen) {
                    tabs[i] = {...tabs[i], ...tab}
                    break
                }
            }
            initialTabIndex = i
        }

        let tabsStyle = { // optional, add this if you want to style the tab bar beyond the defaults
            tabBarButtonColor: Colors.black, // optional, change the color of the tab icons and text (also unselected)
            tabBarSelectedButtonColor: Colors.green, // optional, change the color of the selected tab icon and text (only selected)
            tabBarBackgroundColor: NAV_BACKGROUND_COLOR,
            forceTitlesDisplay: false,
            initialTabIndex: initialTabIndex,
        }


        Navigation.startTabBasedApp({
            tabs: tabs,
            tabsStyle,
            appStyle: {
                orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                // bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                // bottomTabBadgeBackgroundColor: 'green', // Optional, change badge background color. Android only
                backButtonImage: require('./img2/leftBackArrowGrey.png'),
                hideBackButtonTitle: true,
                ...UI.NavStyles, //added when showing modals, on ios
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
        })

        if (modal) {
            Navigation.showModal({
                ...modal,
                navigatorButtons: Nav.CANCELABLE_MODAL,
            })
        }

    }

    startUnlogged() {
        if (this.state.init !== 'initialized') throw "Initialize the app before displaying screens."
        Navigation.startSingleScreenApp({
            screen: {
                label: 'Login',
                screen: 'goodsh.LoginScreen',
                navigatorStyle: {
                    navBarButtonColor: Colors.white,
                    drawUnderNavBar: true,
                    navBarTransparent: true,
                    navBarTranslucent: true,
                    navBarBackgroundColor: Colors.dirtyWhite,
                    topBarElevationShadowEnabled: false
                }
            }
        });
    }

}
