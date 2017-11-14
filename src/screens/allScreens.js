import { Navigation } from 'react-native-navigation';

import {screen as LoginScreen} from './login';
import {screen as NetworkScreen} from './network';
import {screen as SearchScreen} from './search';
import DebugScreen from './DebugScreen';

import {screen as ActivityDetailScreen} from '../activity/activityDetail';
import {screen as LineupListScreen} from './lineups';
import {screen as AddInScreen} from './addinscreen';
import {screen as SavingsScreen} from './savings';
import {screen as HomeScreen, HomeNavBar} from './home';
import {screen as CommentsScreen} from './comments';
import {screen as SaveScreen} from './save';
import {screen as ShareScreen} from './share';
import {screen as ProfileScreen} from './profile';
import FriendScreen from './friends';
import CommunityScreen from './community';
import SendScreen from './send';
import AskScreen from './ask';
import AlgoliaSearchScreen from './algoliasearch';
import UserScreen from './user';
import NetworkSearchScreen from './networksearch';

// register all screens of the app (including internal ones)
export function registerScreens(store, Provider) {
    Navigation.registerComponent('goodsh.LoginScreen', () => LoginScreen, store, Provider);
    Navigation.registerComponent('goodsh.NetworkScreen', () => NetworkScreen, store, Provider);
    Navigation.registerComponent('goodsh.SearchScreen', () => SearchScreen, store, Provider);
    Navigation.registerComponent('goodsh.DebugScreen', () => DebugScreen, store, Provider);
    Navigation.registerComponent('goodsh.FriendsScreen', () => FriendScreen, store, Provider);
    Navigation.registerComponent('goodsh.ActivityDetailScreen', () => ActivityDetailScreen, store, Provider);
    Navigation.registerComponent('goodsh.LineupListScreen', () => LineupListScreen, store, Provider);
    Navigation.registerComponent('goodsh.AddInScreen', () => AddInScreen, store, Provider);
    Navigation.registerComponent('goodsh.HomeScreen', () => HomeScreen, store, Provider);
    Navigation.registerComponent('goodsh.HomeNavBar', () => HomeNavBar, store, Provider);
    Navigation.registerComponent('goodsh.SavingsScreen', () => SavingsScreen, store, Provider);
    Navigation.registerComponent('goodsh.CommentsScreen', () => CommentsScreen, store, Provider);
    Navigation.registerComponent('goodsh.SaveScreen', () => SaveScreen, store, Provider);
    Navigation.registerComponent('goodsh.ShareScreen', () => ShareScreen, store, Provider);
    Navigation.registerComponent('goodsh.CommunityScreen', () => CommunityScreen, store, Provider);
    Navigation.registerComponent('goodsh.SendScreen', () => SendScreen, store, Provider);
    Navigation.registerComponent('goodsh.ProfileScreen', () => ProfileScreen, store, Provider);
    Navigation.registerComponent('goodsh.AskScreen', () => AskScreen, store, Provider);
    Navigation.registerComponent('goodsh.AlgoliaSearchScreen', () => AlgoliaSearchScreen, store, Provider);
    Navigation.registerComponent('goodsh.UserScreen', () => UserScreen, store, Provider);
    Navigation.registerComponent('goodsh.NetworkSearchScreen', () => NetworkSearchScreen, store, Provider);
}