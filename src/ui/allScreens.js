import {Navigation} from 'react-native-navigation';

import {screen as LoginScreen} from './screens/login';
import {screen as NetworkScreen} from './screens/network';
import {screen as SearchItemScreen} from './screens/searchitems';
import DebugScreen from './screens/debug';

import {screen as ActivityDetailScreen} from './activity/activityDetail';
import {LineupListScreen} from './screens/lineuplist';
import AddInScreen from './screens/addinscreen';
import {screen as LineupScreen} from './screens/lineup';
import HomeScreen from './screens/home';
import {screen as CommentsScreen} from './screens/comments';
import {screen as SaveScreen} from './screens/save';
import {screen as ShareScreen} from './screens/share';
import ProfileScreen from './screens/profile';
import FriendScreen from './screens/friends';
import {CommunityScreen} from './screens/community';
import SendScreen from './screens/send';
import AlgoliaSearchScreen from './screens/algoliasearch';
import UserScreen from './screens/user';
import NetworkSearchScreen from './screens/networksearch';
import HomeSearchScreen from './screens/homesearch';
import AddItemScreen from './screens/additem';
import TestScreen from './screens/devtest';
import AskScreen from './screens/asksheet';
import UserSheet from './screens/userSheet';
import MyAvatar from './components/MyAvatar';
import {InteractionScreen} from './screens/interactions';
import AddLineupSheet from './screens/addlineupsheet';
import PlacesAutocomplete from './screens/PlacesAutocomplete';
import UserNav from './components/UserNav';
import LineupNav from './components/LineupNav';
import RnRenderPerfs from 'rn-render-perfs';
import Perf from 'ReactPerf';
import React from 'react';
import {View} from 'react-native';
import UnsaveScreen from "./screens/unsave";
import ChangeDescriptionScreen from "./screens/changeDescription";
import ChangeLineupName from "./screens/changeLineupName";
import MoveInScreen from "./screens/moveinscreen";
import InAppNotif from "./screens/inAppNotif";
import MyInterestsScreen from "./screens/MyInterests";
import MyGoodshsScreen from "./screens/MyGoodsh";
import EditUserProfileScreen from "./screens/edituserprofile";
import PopularItemsScreen from "./screens/popularitems";


function wrap(screenName,screenCreator,store,provider) {

    if (__DEBUG_PERFS__) {
        let Screen = screenCreator();
        screenCreator = () => class extends React.Component {
            render () {
                let perf = Perf;
                setTimeout(() => perf.start());
                return (
                    <View style={{flex: 1}}>
                        {<Screen {...this.props} />}
                        <RnRenderPerfs monitor={perf} />
                    </View>
                )
            }
        };
    }


    Navigation.registerComponent(screenName, screenCreator, store, provider);
}

// register all screens of the app (including internal ones)
export default function registerScreens(store, Provider) {
    const screenCreator = () => {
        return EditUserProfileScreen
    }
    wrap('goodsh.EditUserProfileScreen', screenCreator, store, Provider);
    wrap('goodsh.LoginScreen', () => LoginScreen, store, Provider);
    wrap('goodsh.NetworkScreen', () => NetworkScreen, store, Provider);
    wrap('goodsh.SearchItemsScreen', () => SearchItemScreen, store, Provider);
    wrap('goodsh.DebugScreen', () => DebugScreen, store, Provider);
    wrap('goodsh.FriendsScreen', () => FriendScreen, store, Provider);
    wrap('goodsh.ActivityDetailScreen', () => ActivityDetailScreen, store, Provider);
    wrap('goodsh.LineupListScreen', () => LineupListScreen, store, Provider);
    wrap('goodsh.AddInScreen', () => AddInScreen, store, Provider);
    wrap('goodsh.HomeScreen', () => HomeScreen, store, Provider);
    wrap('goodsh.LineupScreen', () => LineupScreen, store, Provider);
    wrap('goodsh.CommentsScreen', () => CommentsScreen, store, Provider);
    wrap('goodsh.SaveScreen', () => SaveScreen, store, Provider);
    wrap('goodsh.ShareScreen', () => ShareScreen, store, Provider);
    wrap('goodsh.CommunityScreen', () => CommunityScreen, store, Provider);
    wrap('goodsh.SendScreen', () => SendScreen, store, Provider);
    wrap('goodsh.ProfileScreen', () => ProfileScreen, store, Provider);
    wrap('goodsh.AlgoliaSearchScreen', () => AlgoliaSearchScreen, store, Provider);
    wrap('goodsh.UserScreen', () => UserScreen, store, Provider);
    wrap('goodsh.NetworkSearchScreen', () => NetworkSearchScreen, store, Provider);
    wrap('goodsh.HomeSearchScreen', () => HomeSearchScreen, store, Provider);
    wrap('goodsh.AddItemScreen', () => AddItemScreen, store, Provider);
    wrap('goodsh.TestScreen', () => TestScreen, store, Provider);
    wrap('goodsh.InteractionScreen', () => InteractionScreen, store, Provider);
    wrap('goodsh.MyAvatar', () => MyAvatar, store, Provider);
    wrap('goodsh.UserNav', () => UserNav, store, Provider);
    wrap('goodsh.LineupNav', () => LineupNav, store, Provider);
    wrap('goodsh.UserSheet', () => UserSheet, store, Provider);
    wrap('goodsh.AddLineupSheet', () => AddLineupSheet, store, Provider);
    wrap('goodsh.UnsaveScreen', () => UnsaveScreen, store, Provider);
    wrap('goodsh.ChangeDescriptionScreen', () => ChangeDescriptionScreen, store, Provider);
    wrap('goodsh.ChangeLineupName', () => ChangeLineupName, store, Provider);
    wrap('goodsh.PlacesAutocomplete', () => PlacesAutocomplete, store, Provider);
    wrap('goodsh.MoveInScreen', () => MoveInScreen, store, Provider);
    wrap('goodsh.InAppNotif', () => InAppNotif, store, Provider);
    wrap('goodsh.MyInterestsScreen', () => MyInterestsScreen, store, Provider);
    wrap('goodsh.MyGoodshsScreen', () => MyGoodshsScreen, store, Provider);
    wrap('goodsh.PopularItemsScreen', () => PopularItemsScreen, store, Provider);
    wrap('goodsh.AskScreen', () => AskScreen, store, Provider);

}
