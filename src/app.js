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
import {setCustomText, setCustomTextInput} from 'react-native-global-props';
import * as notification from './notification';
import * as DeviceManager from "./DeviceManager";


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

console.disableYellowBox = true;

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

    setCustomText({
        style: {
            fontFamily: 'Thonburi',
            color: 'black'
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
            paddingHorizontal: 10,
            backgroundColor: 'white'
        }
    };

    setCustomTextInput(customTextInputProps);


    // Component.setState.prototype = function setState(imconpleteState, callback) {
    //     console.log("coucouc");
    //     this.setState(imconpleteState, callback);
    // };


    console.info("App initialized.");
};
// begin periodically persisting the store
persistStore(store,
    {
        storage: AsyncStorage,
        transforms: [createTransform(immutableTransform.in, immutableTransform.out, immutableTransform.config)],
        whitelist: ['auth','device']
    },
    () => {
        console.log("persist store complete");
        hydrated = true;
        configureApp();
    }
);

Api.init(store);
CurrentUser.init(store);
DeviceManager.init(store);


const bugsnag = new Client();

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
            console.debug("waiting for rehydration");
            return;
        }
        console.debug("resolving logged");

        const {currentUserId} = store.getState().auth;

        let id = CurrentUser.currentUserId();

        if (id !== currentUserId) throw "inconsistent current_user_id";


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

        if (!logged) {
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
        else if (testScreen) {
            Navigation.startSingleScreenApp(testScreen);
        }
        else {
            let userId = CurrentUser.currentUserId();
            if (!userId) throw "wtf";

            Navigation.startTabBasedApp({
                tabs: [
                    {
                        label: i18n.t('tabs.home.label'),
                        screen: 'goodsh.HomeScreen',
                        icon: require('./img/drawer_line_up.png'),
                        titleImage: require('./img/screen_title_home.png'),
                        title: i18n.t('tabs.home.title')
                    },
                    {
                        label: 'Network', // tab label as appears under the icon in iOS (optional)
                        screen: 'goodsh.NetworkScreen', // unique ID registered with Navigation.registerScreen
                        icon: require('./img/bottom_bar_search.png'), // local image asset for the tab icon unselected state (optional on iOS)
                        title: 'Mon réseau', // title of the screen as appears in the nav bar (optional)
                        titleImage: require('./img/screen_title_home.png'),
                    },

                ],
                tabsStyle: { // optional, add this if you want to style the tab bar beyond the defaults
                    tabBarButtonColor: '#000', // optional, change the color of the tab icons and text (also unselected)
                    //tabBarSelectedButtonColor: '#40E7BB', // optional, change the color of the selected tab icon and text (only selected)
                    tabBarBackgroundColor: 'white',
                    forceTitlesDisplay: false,
                    tabBarShowLabels: 'hidden',
                    initialTabIndex: 0,
                },
                appStyle: {
                    orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                    bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                    bottomTabBadgeBackgroundColor: 'green' // Optional, change badge background color. Android only
                },
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
                        enabled: false,
                        passProps: {} // simple serializable object that will pass as props to all top screens (optional)
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