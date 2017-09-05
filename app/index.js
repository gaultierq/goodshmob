
import { Navigation } from 'react-native-navigation';

import { registerScreens } from './screens';

registerScreens(); // this is where you register all of your app's screens


import Login from './screens/Login';


// start the app
Navigation.startTabBasedApp({
    tabs: [
        {
            label: 'Login',
            screen: 'example.Login',
            icon: require('./img/profil.png'),
            //selectedIcon: require('../img/two_selected.png'), // iOS only
            title: 'Login screen'
        }
    ]
});