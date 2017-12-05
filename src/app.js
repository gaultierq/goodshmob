// @flow

import {Component} from 'react';
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {Provider} from "react-redux";
import {Navigation} from 'react-native-navigation';
import {registerScreens} from './screens/allScreens';
import * as reducers from "./reducers/allReducers";
import {createWithReducers} from "./auth/reducer";
import thunk from "redux-thunk";
import logger from 'redux-logger'

import * as Api from './utils/Api';
import {middleware as apiMiddleware} from './utils/Api';
import {autoRehydrate, createTransform, persistStore} from 'redux-persist'
import {AsyncStorage, TouchableWithoutFeedback} from 'react-native'
import immutableTransform from './immutableTransform'
import {REHYDRATE} from 'redux-persist/constants'
import Immutable from 'seamless-immutable';
import i18n from './i18n/i18n'
import * as CurrentUser from './CurrentUser'
import testScreen from "./testScreen"
import {Client} from 'bugsnag-react-native';
import * as globalProps from 'react-native-global-props';
import * as notification from './notification';
import * as DeviceManager from "./DeviceManager";
import * as UI from "./screens/UIStyles";
import {init as initGlobal} from "./global";
import Config from 'react-native-config'
import {AlgoliaClient} from "./utils/AlgoliaUtils";


const USE_CACHE_LOCAL = true;

console.log(`staring app with env=${JSON.stringify(Config)}`);

initGlobal();

let hydrated = false;

//this is shit
const initialState = () => Immutable({
    rehydrated: hydrated,
});

const appReducer = (state = initialState(), action) => {
    switch (action.type) {
        case REHYDRATE:
            return state.merge({rehydrated: true})
    }
    return state;
};

//see the network requests in the debugger
//TODO: doesnt work yet
//GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
//if (!__IS_LOCAL__) {
console.disableYellowBox = true;
//}

let allReducers = combineReducers({...reducers, app: appReducer});
const reducer = createWithReducers(allReducers);
const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    compose(
        applyMiddleware(apiMiddleware, thunk, logger),
        autoRehydrate()
    )
);


let configureApp = function () {
//store.dispatch(appActions.onAppReady());

    globalProps.setCustomText({
        style: {
            fontFamily: 'Thonburi',
            color: 'black',
        }
    });

    globalProps.setCustomView({
        style: {
            backgroundColor: 'transparent'
        }
    });

    // setCustomTouchableWithoutFeedback({
    //     underlayColor: "red"
    // });
    // const DEFAULT_PROPS = {
    //     activeOpacity: 0.85,
    //     underlayColor: 'red',
    // };
    //
    // TouchableWithoutFeedback.prototype.getDefaultProps = function getDefaultProps() {
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


    console.info("App initialized.");
};
// begin periodically persisting the store
let persistConfig = {
    storage: AsyncStorage,
    transforms: [createTransform(immutableTransform.in, immutableTransform.out, immutableTransform.config)],
    // whitelist: ['auth','device']
};

if (!__IS_LOCAL__ || !USE_CACHE_LOCAL) {
    persistConfig = {...persistConfig, whitelist: ['auth','device']};
}
persistStore(store,
    persistConfig,
    () => {
        console.log("persist store complete");
        hydrated = true;
        configureApp();
    }
);

Api.init(store);
CurrentUser.init(store);
DeviceManager.init(store);
AlgoliaClient.init(store);

if (!__IS_LOCAL__) {
    const bugsnag = new Client();
}

//bugsnag.notify(new Error("Test Error"));


// screen related book keeping
registerScreens(store, Provider);


export default class App {

    logged = null;
    started;

    constructor() {
        // since react-redux only works on components, we need to subscribe this class manually
        store.subscribe(this.onStoreUpdate.bind(this));

        this.resolveLogged();
    }

    onStoreUpdate() {
        this.resolveLogged();
    }

    resolveLogged() {
        //waiting rehydration before starting app
        let rehydrated = store.getState().app.rehydrated;
        if (!rehydrated) {
            console.debug("waiting for rehydration1");
            return;
        }
        console.debug("resolving logged");

        const {currentUserId} = store.getState().auth;

        let id = CurrentUser.currentUserId();

        if (id !== currentUserId) {
            console.warn(`inconsistent current_user_id: ${id}!=${currentUserId}`);
            return;
        }

        let logged = !!currentUserId;

        //TODO: use navigation to resolve the current screen
        if (this.logged !== logged) {
            this.logged = logged;
            this.startApp(logged);
        }
        if (!this.started) {
            this.started = true;
            notification.load();

        }
    }

    startApp(logged: boolean) {
        console.debug(`starting app logged=${logged}, test=${(!!testScreen)}`);

        /*if (__IS_LOCAL__ && testScreen) {
            Navigation.startSingleScreenApp(testScreen);
        }
        else */if (!logged) {
            Navigation.startSingleScreenApp({
                screen: {
                    label: 'Login',
                    screen: 'goodsh.LoginScreen',
                    navigatorStyle: {
                        navBarHidden: true,
                    }
                }
            });
        }
        else if (__IS_LOCAL__ && testScreen) {
            Navigation.startSingleScreenApp(testScreen);
        }
        else {
            let userId = CurrentUser.currentUserId();
            if (!userId) throw "wtf";

            let tabsStyle = { // optional, add this if you want to style the tab bar beyond the defaults
                tabBarButtonColor: '#000', // optional, change the color of the tab icons and text (also unselected)
                tabBarSelectedButtonColor: UI.Colors.green, // optional, change the color of the selected tab icon and text (only selected)
                tabBarBackgroundColor: 'white',
                forceTitlesDisplay: false,
                tabBarShowLabels: 'hidden',
                initialTabIndex: 0,
            };

            let navigatorStyle = {...UI.NavStyles};

            Navigation.startTabBasedApp({
                tabs: [
                    {
                        label: i18n.t('tabs.home.label'),
                        screen: 'goodsh.HomeScreen',
                        icon: require('./img/drawer_line_up.png'),
                        titleImage: require('./img/screen_title_home.png'),
                        title: i18n.t('tabs.home.title'),
                        navigatorStyle

                    },
                    {
                        label: 'Network', // tab label as appears under the icon in iOS (optional)
                        screen: 'goodsh.NetworkScreen', // unique ID registered with Navigation.registerScreen
                        icon: require('./img/bottom_bar_search.png'), // local image asset for the tab icon unselected state (optional on iOS)
                        title: 'Mon réseau', // title of the screen as appears in the nav bar (optional)
                        titleImage: require('./img/screen_title_home.png'),
                        navigatorStyle
                    },

                ],
                tabsStyle,
                appStyle: {
                    orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                    bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                    bottomTabBadgeBackgroundColor: 'green', // Optional, change badge background color. Android only
                    backButtonImage: require('./img/back.png'),
                    hideBackButtonTitle: true,
                    ...tabsStyle,
                },
                // passProps: {
                //     // could be passed to the drawer
                //     drawerRight: {
                //         onScreen: true
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
                    right: { // optional, define if you want a drawer from the right
                        screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
                        // enabled: false,
                        passProps: {
                            onScreen: true //with current RNN version there are no way to detect if drawer is opened yet
                        } // simple serializable object that will pass as props to all top screens (optional)
                    },
                    style: { // ( iOS only )
                        drawerShadow: true, // optional, add this if you want a side menu drawer shadow
                        contentOverlayColor: 'rgba(0,0,0,0.25)', // optional, add this if you want a overlay color when drawer is open
                        leftDrawerWidth: 80, // optional, add this if you want a define left drawer width (50=percent)
                        rightDrawerWidth: 80 // optional, add this if you want a define right drawer width (50=percent)
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
    }
}