import { Navigation } from 'react-native-navigation';

import {screen as LoginScreen} from './login';
import {screen as NetworkScreen} from './network';
import {screen as SearchItemScreen} from './searchitems';
import DebugScreen from './DebugScreen';

import {screen as ActivityDetailScreen} from '../activity/activityDetail';
import {LineupListScreen} from './lineuplist';
import {screen as AddInScreen} from './addinscreen';
import {screen as LineupScreen} from './lineup';
import {screen as HomeScreen} from './home';
import {screen as CommentsScreen} from './comments';
import {screen as SaveScreen} from './save';
import {screen as ShareScreen} from './share';
import {screen as ProfileScreen} from './profile';
import FriendScreen from './friends';
import {CommunityScreen} from './community';
import SendScreen from './send';
import AskScreen from './ask';
import AlgoliaSearchScreen from './algoliasearch';
import UserScreen from './user';
import NetworkSearchScreen from './networksearch';
import HomeSearchScreen from './homesearch';
import AddItemScreen from './additem';
import TestScreen from './test';
import {InteractionScreen} from './interactions';

// register all screens of the app (including internal ones)
export function registerScreens(store, Provider) {
    Navigation.registerComponent('goodsh.LoginScreen', () => LoginScreen, store, Provider);
    Navigation.registerComponent('goodsh.NetworkScreen', () => NetworkScreen, store, Provider);
    Navigation.registerComponent('goodsh.SearchItemsScreen', () => SearchItemScreen, store, Provider);
    Navigation.registerComponent('goodsh.DebugScreen', () => DebugScreen, store, Provider);
    Navigation.registerComponent('goodsh.FriendsScreen', () => FriendScreen, store, Provider);
    Navigation.registerComponent('goodsh.ActivityDetailScreen', () => ActivityDetailScreen, store, Provider);
    Navigation.registerComponent('goodsh.LineupListScreen', () => LineupListScreen, store, Provider);
    Navigation.registerComponent('goodsh.AddInScreen', () => AddInScreen, store, Provider);
    Navigation.registerComponent('goodsh.HomeScreen', () => HomeScreen, store, Provider);
    // Navigation.registerComponent('goodsh.HomeNavBar', () => HomeNavBar, store, Provider);
    Navigation.registerComponent('goodsh.LineupScreen', () => LineupScreen, store, Provider);
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
    Navigation.registerComponent('goodsh.HomeSearchScreen', () => HomeSearchScreen, store, Provider);
    Navigation.registerComponent('goodsh.AddItemScreen', () => AddItemScreen, store, Provider);
    Navigation.registerComponent('goodsh.TestScreen', () => TestScreen, store, Provider);
    Navigation.registerComponent('goodsh.InteractionScreen', () => InteractionScreen, store, Provider);
}