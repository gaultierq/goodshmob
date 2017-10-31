// @flow

import {compose, createStore, applyMiddleware, combineReducers} from "redux";
import {Provider} from "react-redux";
import { Navigation } from 'react-native-navigation';
import { registerScreens} from './screens/allScreens';
import * as reducers from "./reducers/allReducers";
import {createWithReducers} from "./auth/reducer";
import  * as appActions from './auth/actions'
import thunk from "redux-thunk";
import logger from 'redux-logger'

import {middleware as apiMiddleware} from './utils/Api';
import {persistStore, autoRehydrate, createTransform} from 'redux-persist'
import {AsyncStorage} from 'react-native'
import  immutableTransform from './immutableTransform'
import {REHYDRATE} from 'redux-persist/constants'
import Immutable from 'seamless-immutable';
import * as Api from "./utils/Api";
import i18n from './i18n/i18n'
import * as CurrentUser from './CurrentUser'

const initialState = Immutable({
    rehydrated: false,
});

const appReducer = (state = initialState, action) => {
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

let hydrated = false;

// begin periodically persisting the store
persistStore(store,
    {
        storage: AsyncStorage,
        transforms: [createTransform(immutableTransform.in, immutableTransform.out, immutableTransform.config)],
        whitelist: ['auth']
    },
    () => {
        console.log("persist store complete");
        hydrated = true;
        store.dispatch(appActions.onAppReady());
    }
);

Api.init(store);
CurrentUser.init(store);


// screen related book keeping
registerScreens(store, Provider);


export default class App {

    //screen: 'goodsh.ActivityDetailScreen',
    // screen: 'goodsh.LineupListScreen',

    logged = null;

    // testScreen = null;


    // testScreen = {
    //     screen: {
    //         label: 'test',
    //         screen: 'goodsh.CommunityScreen',
    //     },
    //     passProps: {
    //         // item: {
    //         //     id: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
    //         //     title: "test_title",
    //         //     url: "test_url"
    //         // },
    //         userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    //     }
    // };

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
        if (!hydrated) {
            console.debug("waiting for rehydration");
            return;
        }
        console.debug("resolving logged");

        const {currentUserId} = store.getState().auth;

        let logged = !!currentUserId;

        //TODO: use navigation to resolve the current screen
        if (this.logged !== logged) {
            this.logged = logged;
            this.startApp(logged);
        }
    }

    startApp(logged: boolean) {
        console.debug(`starting app logged=${logged}, test=${(!!this.testScreen)}`);

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
        else if (this.testScreen) {
            Navigation.startSingleScreenApp(this.testScreen);
        }
        else {
            Navigation.startTabBasedApp({
                tabs: [
                    {
                        label: i18n.t('tabs.home.label'),
                        screen: 'goodsh.HomeScreen',
                        icon: require('./img/bottom_bar_home.png'),
                        // title: 'Search'
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
                    tabBarSelectedButtonColor: '#40E7BB', // optional, change the color of the selected tab icon and text (only selected)
                    tabBarBackgroundColor: 'white',
                    forceTitlesDisplay: false,
                    tabBarShowLabels: 'hidden',
                    initialTabIndex: 1,
                },
                appStyle: {
                    orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                    bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                    bottomTabBadgeBackgroundColor: 'green' // Optional, change badge background color. Android only
                },
                drawer: { // optional, add this if you want a side menu drawer in your app
                    left: { // optional, define if you want a drawer from the left
                        // screen: 'goodsh.FriendsScreen',
                        screen: 'goodsh.DebugScreen', // unique ID registered with Navigation.registerScreen
                        passProps: {} // simple serializable object that will pass as props to all top screens (optional)
                    },
                    right: { // optional, define if you want a drawer from the right
                        screen: 'goodsh.LineupListScreen', // unique ID registered with Navigation.registerScreen
                        passProps: {} // simple serializable object that will pass as props to all top screens (optional)
                    },
                    style: { // ( iOS only )
                        drawerShadow: true, // optional, add this if you want a side menu drawer shadow
                        contentOverlayColor: 'rgba(0,0,0,0.25)', // optional, add this if you want a overlay color when drawer is open
                        leftDrawerWidth: 100, // optional, add this if you want a define left drawer width (50=percent)
                        rightDrawerWidth: 100 // optional, add this if you want a define right drawer width (50=percent)
                    },
                    type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
                    animationType: 'slide-and-scale', //optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
                    // for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
                    disableOpenGesture: true// optional, can the drawer be opened with a swipe instead of button
                },
                passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
                //animationType: 'slide-down' // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
            });

        }
    }
}