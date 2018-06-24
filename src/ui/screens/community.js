// @flow

import React from 'react'
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import {ViewStyle} from "../../types"
import FriendsScreen from "./friends"
import {PagerPan, TabBar, TabView} from 'react-native-tab-view'

import ApiAction from "../../helpers/ApiAction"
import * as Api from "../../managers/Api"
import Immutable from 'seamless-immutable'
import {InteractionScreen} from "./interactions"
import Screen from "../components/Screen"
import {Colors} from "../colors"
import {TAB_BAR_PROPS} from "../UIStyles"
import ShareButton from "../components/ShareButton"

type Props = {
    navigator:any,
    style?: ViewStyle
};

type State = {
    index?: number
};

const FETCH_PEOPLE_YOU_MAY_KNOW = ApiAction.create("people_you_may_know", "retrieve the user network he might know");

const ROUTES = [
    {key: `interactions`, title: i18n.t("community_screen.tabs.notifications")},
    {key: `friends`, title: i18n.t("community_screen.tabs.friends")},
]

@logged
@connect((state, ownProps) => ({
    peopleYouMayKnow: state.peopleYouMayKnow,
    data: state.data,
}))
export class CommunityScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    state = {
        index: 0,
        routes: ROUTES,
    };

    //FIXME: when in displayed within a drawer, everything is fucked up
    isVisible() {
        return true;
    }

    render() {
        return (

            <TabView
                style={
                    [
                        {flex: 1},
                        //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                        //this.props.style || __IS_IOS__? {marginTop: 38} : {}
                    ]
                }
                navigationState={{...this.state, visible: this.isVisible()}}
                renderScene={this.renderScene.bind(this)}
                renderTabBar={props => <TabBar {...TAB_BAR_PROPS} {...props}/>}
                onIndexChange={index => this.setState({index})}
                renderPager={props => <PagerPan {...props} />}
            />
        )
    }


    renderScene({route}: *) {
        let ix = ROUTES.indexOf(route)
        let focused = this.state.index === ix
        const navigator = this.props.navigator;
        switch (route.key) {
            case 'friends':
                return (
                    <FriendsScreen
                        userId={currentUserId()}
                        navigator={navigator}
                        //renderItem={(item) => this.renderItem(item)}
                        ListHeaderComponent={<ShareButton text={i18n.t('actions.invite')}/>}
                        style={{backgroundColor: Colors.white}}
                        visibility={focused ? 'visible' : 'hidden'}
                    />
                )
            case 'interactions':
                return (
                    <InteractionScreen
                        navigator={navigator}
                        visibility={focused ? 'visible' : 'hidden'}
                    />
                )
            default: throw "unexpected"
        }
    }
}

export const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action) => {
        return Api.reduceList(state, action, {fetchFirst: FETCH_PEOPLE_YOU_MAY_KNOW});
    }
})();
