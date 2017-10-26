import { Navigation } from 'react-native-navigation';

import {screen as LoginScreen} from './login';
import {screen as NetworkScreen} from './network';
import {screen as SearchScreen} from './search';
import DebugScreen from './DebugScreen';
import {screen as FriendScreen} from './community';
import {screen as ActivityDetailScreen} from '../activity/activityDetail';
import {screen as LineupListScreen} from './lineups';
import {screen as SavingsScreen} from './savings';
import {screen as HomeScreen} from './home';
import {screen as CommentsScreen} from './comments';
import {screen as SaveScreen} from './save';
import {screen as ShareScreen} from './share';

// register all screens of the app (including internal ones)
export function registerScreens(store, Provider) {
    Navigation.registerComponent('goodsh.LoginScreen', () => LoginScreen, store, Provider);
    Navigation.registerComponent('goodsh.NetworkScreen', () => NetworkScreen, store, Provider);
    Navigation.registerComponent('goodsh.SearchScreen', () => SearchScreen, store, Provider);
    Navigation.registerComponent('goodsh.DebugScreen', () => DebugScreen, store, Provider);
    Navigation.registerComponent('goodsh.CommunityScreen', () => FriendScreen, store, Provider);
    Navigation.registerComponent('goodsh.ActivityDetailScreen', () => ActivityDetailScreen, store, Provider);
    Navigation.registerComponent('goodsh.LineupListScreen', () => LineupListScreen, store, Provider);
    Navigation.registerComponent('goodsh.HomeScreen', () => HomeScreen, store, Provider);
    Navigation.registerComponent('goodsh.SavingsScreen', () => SavingsScreen, store, Provider);
    Navigation.registerComponent('goodsh.CommentsScreen', () => CommentsScreen, store, Provider);
    Navigation.registerComponent('goodsh.SaveScreen', () => SaveScreen, store, Provider);
    Navigation.registerComponent('goodsh.ShareScreen', () => ShareScreen, store, Provider);
}