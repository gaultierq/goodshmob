import { Navigation } from 'react-native-navigation';

import LoginScreen from '../components/Login';

// register all screens of the app (including internal ones)
export function registerScreens() {
    Navigation.registerComponent('example.Login', () => LoginScreen);
}