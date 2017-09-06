import { Navigation } from 'react-native-navigation';

import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';

// register all screens of the app (including internal ones)
export function registerScreens() {
    Navigation.registerComponent('goodsh.LoginScreen', () => LoginScreen);
    Navigation.registerComponent('goodsh.MainScreen', () => MainScreen);
}


export const LoginScreenConfig = {
    label: 'Login',
    screen: 'goodsh.LoginScreen',
    icon: require('../img/profil.png'),
    //selectedIcon: require('../img/two_selected.png'), // iOS only
    navigatorStyle: {
        navBarHidden: true,
    }
};