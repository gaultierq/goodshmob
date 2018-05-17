// @flow

import React from 'react';
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Id} from "../../types";
import FriendsScreen from "./friends";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';

import ApiAction from "../../helpers/ApiAction";
import * as Api from "../../managers/Api";
import Immutable from 'seamless-immutable';
import {InteractionScreen} from "./interactions";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import {NavStyles, TAB_BAR_PROPS} from "../UIStyles";
import ShareButton from "../components/ShareButton";

type Props = {
    navigator:any,
    style?: any
};

type State = {
};

const FETCH_PEOPLE_YOU_MAY_KNOW = ApiAction.create("people_you_may_know", "retrieve the user network he might know");

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
        routes: [
            {key: `interactions`, title: i18n.t("community_screen.tabs.notifications")},
            {key: `friends`, title: i18n.t("community_screen.tabs.friends")},
        ],
    };

    //FIXME: when in displayed within a drawer, everything is fucked up
    isVisible() {
        return true;
    }

    render() {
        return (

            <TabViewAnimated
                style={
                    [
                        {flex: 1},
                        //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                        //this.props.style || __IS_IOS__? {marginTop: 38} : {}
                    ]
                }
                navigationState={{...this.state, visible: this.isVisible()}}
                renderScene={this.renderScene.bind(this)}
                renderHeader={props => <TabBar {...TAB_BAR_PROPS} {...props}/>}
                onIndexChange={index => this.setState({index})}
            />
        )
    }


    renderScene({ route }: *) {
        switch (route.key) {
            case 'friends': return this.renderFriends()
            case 'interactions': return this.renderInteractions()
            default: throw "unexpected"
        }
    }

    renderFriends() {
        const {navigator} = this.props;
        return (
            <FriendsScreen
                userId={currentUserId()}
                navigator={navigator}
                //renderItem={(item) => this.renderItem(item)}
                ListHeaderComponent={<ShareButton text={i18n.t('actions.invite')}/>}
                ListFooterComponent={this.renderFriendsSuggestion.bind(this)}
                style={{backgroundColor: Colors.white}}
                //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                // visible={this.isVisible()}
                visible={true}
            />
        )
    }

    renderInteractions() {
        const {navigator} = this.props;
        return (
            <InteractionScreen
                navigator={navigator}
                visible={true}
                //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                // visible={this.isVisible()}
            />
        )
    }

    renderFriendsSuggestion() {
        let peopleYouMayKnow = this.props.peopleYouMayKnow.list;
        return (
            <View>
                {/*<Text>People you may know</Text>*/}
                {/*<Feed*/}
                {/*data={peopleYouMayKnow}*/}
                {/*renderItem={this.renderItem.bind(this)}*/}
                {/*fetchSrc={{*/}
                {/*callFactory: ()=> this.fetchPeopleYouMayKnow(currentUserId()),*/}
                {/*action: FETCH_PEOPLE_YOU_MAY_KNOW,*/}
                {/*}}*/}
                {/*hasMore={false}*/}
                {/*/>*/}
            </View>
        );
    }

    fetchPeopleYouMayKnow(user_id: Id) {
        console.info("==fetchPeopleYouMayKnow==");
        return new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${user_id}/people_you_may_know`);
    }

    renderHeader(props: *) {
        return <TabBar {...TAB_BAR_PROPS} {...props}/>
    }

}

export const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action) => {
        return Api.reduceList(state, action, {fetchFirst: FETCH_PEOPLE_YOU_MAY_KNOW});
    }
})();
