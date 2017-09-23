
import {createStore, applyMiddleware, combineReducers} from "redux";
import {Provider} from "react-redux";
import { Navigation } from 'react-native-navigation';
import { registerScreens} from './screens';
import * as reducers from "./reducers";
import {createWithReducers} from "./app/reducer";
import  * as appActions from './app/actions'
import thunk from "redux-thunk";
import logger from 'redux-logger'
import codePush from "react-native-code-push";
import { apiMiddleware } from 'redux-api-middleware';


//see the network requests in the debugger
//TODO: doesnt work yet
//GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

// redux related book keeping
const createStoreWithMiddleware = applyMiddleware(apiMiddleware, thunk, logger)(createStore);
let appReducers = combineReducers(reducers);

const reducer = createWithReducers(appReducers);

const store = createStoreWithMiddleware(reducer);


// screen related book keeping
registerScreens(store, Provider);


export default class App {
    constructor() {
        // since react-redux only works on components, we need to subscribe this class manually
        store.subscribe(this.onStoreUpdate.bind(this));
        store.dispatch(appActions.appInitialized());

        codePush.sync({
            updateDialog: true,
            installMode: codePush.InstallMode.IMMEDIATE
        });

    }

    onStoreUpdate() {
        const {currentUser} = store.getState().app;

        let logged = !!currentUser;

        if (this.logged !== logged) {
            this.logged = logged;
            this.startApp(logged);
        }
    }

    startApp(logged) {

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
        } else {

            Navigation.startTabBasedApp({
                tabs: [
                    {
                        label: 'Home', // tab label as appears under the icon in iOS (optional)
                        screen: 'goodsh.HomeScreen', // unique ID registered with Navigation.registerScreen
                        icon: require('./img/bottom_bar_home.png'), // local image asset for the tab icon unselected state (optional on iOS)
                        title: 'Home', // title of the screen as appears in the nav bar (optional)
                        titleImage: require('./img/screen_title_home.png'),
                    },
                    {
                        label: 'Search',
                        // screen: 'goodsh.SearchScreen',
                        screen: 'goodsh.LineupScreen',
                        icon: require('./img/bottom_bar_search.png'),
                        // title: 'Search'
                        title: 'Lineup'
                    },
                    {
                        label: 'Add',
                        screen: 'goodsh.AddScreen',
                        icon: require('./img/bottom_bar_add.png'),
                        title: 'Add'
                    },
                    {
                        label: 'Notif',
                        screen: 'goodsh.NotifScreen',
                        icon: require('./img/bottom_bar_notif.png'),
                        title: 'Notif'
                    },
                    {
                        label: 'Ask',
                        screen: 'goodsh.AskScreen',
                        icon: require('./img/bottom_bar_ask.png'),
                        title: 'Debug'
                    },
                ],
                tabsStyle: { // optional, add this if you want to style the tab bar beyond the defaults
                    tabBarButtonColor: '#000', // optional, change the color of the tab icons and text (also unselected)
                    tabBarSelectedButtonColor: '#40E7BB', // optional, change the color of the selected tab icon and text (only selected)
                    tabBarBackgroundColor: 'white',
                    forceTitlesDisplay: false,
                    tabBarShowLabels: 'hidden',
                },
                appStyle: {
                    orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                    bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                    bottomTabBadgeBackgroundColor: 'green' // Optional, change badge background color. Android only
                },
                drawer: { // optional, add this if you want a side menu drawer in your app
                    left: { // optional, define if you want a drawer from the left
                        // screen: 'goodsh.CommunityScreen',
                        screen: 'goodsh.DebugScreen', // unique ID registered with Navigation.registerScreen
                        passProps: {} // simple serializable object that will pass as props to all top screens (optional)
                    },
                    right: { // optional, define if you want a drawer from the right
                        screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
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
                    disableOpenGesture: false // optional, can the drawer be opened with a swipe instead of button
                },
                passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
                //animationType: 'slide-down' // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
            });

        }
    }
}