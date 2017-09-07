
import {createStore, applyMiddleware, combineReducers} from "redux";
import {Provider} from "react-redux";
import { Navigation } from 'react-native-navigation';
import { registerScreens, LoginScreenConfig } from './screens';
import * as reducers from "./reducers";
import  * as appActions from './actions/app'
import thunk from "redux-thunk";
import logger from 'redux-logger'

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
                Navigation.startSingleScreenApp({
                    screen:
                        {
                            label: 'Main',
                            title: 'Goodsh',
                            screen: 'goodsh.MainScreen',
                            icon: require('./img/goodsh.png'),
                        }
                });
                return;
            default:
                console.error('Unknown app root');
        }
    }
}