import { Navigation } from 'react-native-navigation';

import LoginScreen from './Login';
import MainScreen from './MainScreen';

// register all screens of the app (including internal ones)
export function registerScreens() {
    Navigation.registerComponent('example.Login', () => LoginScreen);
    Navigation.registerComponent('example.MainScreen', () => MainScreen);
}