
import { Navigation } from 'react-native-navigation';

import { registerScreens, LoginScreenConfig } from './screens';

import LoginManager from './managers/LoginManager'

registerScreens(); // this is where you register all of your app's screens


import Login from './screens/LoginScreen';

// start the app
LoginManager.readUser().then((user) => {
    if (user) {
        console.warn("looool2: " + LoginScreenConfig);
        Navigation.startSingleScreenApp({
            screen:
                {
                    label: 'Main',
                    title: 'Goodsh',
                    screen: 'goodsh.MainScreen',
                    icon: require('./img/goodsh.png'),
                }
        });
    }
    else {
        console.warn("looool: " + LoginScreenConfig);
        Navigation.startSingleScreenApp({
            screen: LoginScreenConfig
        });

    }
});


