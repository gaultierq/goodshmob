
import {createStore, applyMiddleware, combineReducers} from "redux";
import {Provider} from "react-redux";
import { Navigation } from 'react-native-navigation';
import { registerScreens, LoginScreenConfig } from './screens';
import * as reducers from "./reducers";
import  * as appActions from './actions/appActions'
import thunk from "redux-thunk";
import logger from 'redux-logger'

//see the network requests in the debugger
//TODO: doesnt work yet
//GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

// redux related book keeping
const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);


// screen related book keeping
registerScreens(store, Provider);



export default class App {
    constructor() {
        // since react-redux only works on components, we need to subscribe this class manually
        store.subscribe(this.onStoreUpdate.bind(this));
        store.dispatch(appActions.appInitialized());

    }

    onStoreUpdate() {
        const {root} = store.getState().app;
        // handle a root change
        // if your app doesn't change roots in runtime, you can remove onStoreUpdate() altogether
        if (this.currentRoot != root) {
            this.currentRoot = root;
            this.startApp(root);
        }
    }

    startApp(root) {

        switch (root) {
            case 'login':
                Navigation.startSingleScreenApp({
                    screen: {
                        label: 'Login',
                        screen: 'goodsh.LoginScreen',
                        icon: require('./img/profil.png'),
                        //selectedIcon: require('../img/two_selected.png'), // iOS only
                        navigatorStyle: {
                            navBarHidden: true,
                        }
                    }
                });
                return;
            case 'after-login':
                // Navigation.startSingleScreenApp({
                //     screen:
                //         {
                //             label: 'Main',
                //             title: 'Goodsh',
                //             screen: 'goodsh.MainScreen',
                //             icon: require('./img/goodsh.png'),
                //         }
                // });

                Navigation.startTabBasedApp({
                    tabs: [
                        {
                            label: 'Home', // tab label as appears under the icon in iOS (optional)
                            screen: 'goodsh.MainScreen', // unique ID registered with Navigation.registerScreen
                            icon: require('./img/goodsh.png'), // local image asset for the tab icon unselected state (optional on iOS)
                            //selectedIcon: require('../img/one_selected.png'), // local image asset for the tab icon selected state (optional, iOS only. On Android, Use `tabBarSelectedButtonColor` instead)
                            iconInsets: { // add this to change icon position (optional, iOS only).
                                top: 6, // optional, default is 0.
                                left: 0, // optional, default is 0.
                                bottom: -6, // optional, default is 0.
                                right: 0 // optional, default is 0.
                            },
                            title: 'Home', // title of the screen as appears in the nav bar (optional)
                            //titleImage: require('../img/titleImage.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
                            navigatorStyle: {}, // override the navigator style for the tab screen, see "Styling the navigator" below (optional),
                            navigatorButtons: {} // override the nav buttons for the tab screen, see "Adding buttons to the navigator" below (optional)
                        },
                        {
                            label: 'Debug',
                            screen: 'goodsh.DebugScreen',
                            icon: require('./img/goodsh.png'),
                            // selectedIcon: require('../img/two_selected.png'),
                            title: 'Debug'
                        }
                    ],
                    tabsStyle: { // optional, add this if you want to style the tab bar beyond the defaults
                        tabBarButtonColor: '#ffff00', // optional, change the color of the tab icons and text (also unselected)
                        tabBarSelectedButtonColor: '#ff9900', // optional, change the color of the selected tab icon and text (only selected)
                        tabBarBackgroundColor: '#551A8B', // optional, change the background color of the tab bar
                        //initialTabIndex: 1, // optional, the default selected bottom tab. Default: 0
                    },
                    appStyle: {
                        orientation: 'portrait', // Sets a specific orientation to the entire app. Default: 'auto'. Supported values: 'auto', 'landscape', 'portrait'
                        bottomTabBadgeTextColor: 'red', // Optional, change badge text color. Android only
                        bottomTabBadgeBackgroundColor: 'green' // Optional, change badge background color. Android only
                    },
                    // drawer: { // optional, add this if you want a side menu drawer in your app
                    //     left: { // optional, define if you want a drawer from the left
                    //         screen: 'example.FirstSideMenu', // unique ID registered with Navigation.registerScreen
                    //         passProps: {} // simple serializable object that will pass as props to all top screens (optional)
                    //     },
                    //     right: { // optional, define if you want a drawer from the right
                    //         screen: 'example.SecondSideMenu', // unique ID registered with Navigation.registerScreen
                    //         passProps: {} // simple serializable object that will pass as props to all top screens (optional)
                    //     },
                    //     style: { // ( iOS only )
                    //         drawerShadow: true, // optional, add this if you want a side menu drawer shadow
                    //         contentOverlayColor: 'rgba(0,0,0,0.25)', // optional, add this if you want a overlay color when drawer is open
                    //         leftDrawerWidth: 50, // optional, add this if you want a define left drawer width (50=percent)
                    //         rightDrawerWidth: 50 // optional, add this if you want a define right drawer width (50=percent)
                    //     },
                    //     type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
                    //     animationType: 'door', //optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
                    //     // for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
                    //     disableOpenGesture: false // optional, can the drawer be opened with a swipe instead of button
                    // },
                    passProps: {}, // simple serializable object that will pass as props to all top screens (optional)
                    //animationType: 'slide-down' // optional, add transition animation to root change: 'none', 'slide-down', 'fade'
                });




                return;
            default:
                console.error('Unknown app root');
        }
    }
}