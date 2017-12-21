import {Navigation} from 'react-native-navigation';

import {screen as LoginScreen} from './login';
import {screen as NetworkScreen} from './network';
import {screen as SearchItemScreen} from './searchitems';
import {SearchNavBar} from './search';
import DebugScreen from './DebugScreen';

import {screen as ActivityDetailScreen} from '../activity/activityDetail';
import {LineupListScreen} from './lineuplist';
import {screen as AddInScreen} from './addinscreen';
import {screen as LineupScreen} from './lineup';
import {screen as HomeScreen} from './home';
import {screen as CommentsScreen} from './comments';
import {screen as SaveScreen} from './save';
import {screen as ShareScreen} from './share';
import ProfileScreen from './profile';
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


import RnRenderPerfs from 'rn-render-perfs';
import Perf from 'ReactPerf';

import React from 'react';
import {View} from 'react-native';


function wrap(screenName,screenCreator,store,provider) {

    if (__IS_LOCAL__ && __DEBUG_PERFS__) {
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
    wrap('goodsh.LoginScreen', () => LoginScreen, store, Provider);
    wrap('goodsh.NetworkScreen', () => NetworkScreen, store, Provider);
    wrap('goodsh.SearchItemsScreen', () => SearchItemScreen, store, Provider);
    wrap('goodsh.DebugScreen', () => DebugScreen, store, Provider);
    wrap('goodsh.FriendsScreen', () => FriendScreen, store, Provider);
    wrap('goodsh.ActivityDetailScreen', () => ActivityDetailScreen, store, Provider);
    wrap('goodsh.LineupListScreen', () => LineupListScreen, store, Provider);
    wrap('goodsh.AddInScreen', () => AddInScreen, store, Provider);
    wrap('goodsh.HomeScreen', () => HomeScreen, store, Provider);
    wrap('goodsh.SearchNavBar', () => SearchNavBar, store, Provider);
    wrap('goodsh.LineupScreen', () => LineupScreen, store, Provider);
    wrap('goodsh.CommentsScreen', () => CommentsScreen, store, Provider);
    wrap('goodsh.SaveScreen', () => SaveScreen, store, Provider);
    wrap('goodsh.ShareScreen', () => ShareScreen, store, Provider);
    wrap('goodsh.CommunityScreen', () => CommunityScreen, store, Provider);
    wrap('goodsh.SendScreen', () => SendScreen, store, Provider);
    wrap('goodsh.ProfileScreen', () => ProfileScreen, store, Provider);
    wrap('goodsh.AskScreen', () => AskScreen, store, Provider);
    wrap('goodsh.AlgoliaSearchScreen', () => AlgoliaSearchScreen, store, Provider);
    wrap('goodsh.UserScreen', () => UserScreen, store, Provider);
    wrap('goodsh.NetworkSearchScreen', () => NetworkSearchScreen, store, Provider);
    wrap('goodsh.HomeSearchScreen', () => HomeSearchScreen, store, Provider);
    wrap('goodsh.AddItemScreen', () => AddItemScreen, store, Provider);
    wrap('goodsh.TestScreen', () => TestScreen, store, Provider);
    wrap('goodsh.InteractionScreen', () => InteractionScreen, store, Provider);
}