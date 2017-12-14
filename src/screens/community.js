// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import type {Id, Item} from "../types";
import FriendsScreen from "./friends";
import FriendCell from "./components/FriendCell";
import {currentUserId} from "../CurrentUser";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import * as UIStyles from "./UIStyles";

import ApiAction from "../utils/ApiAction";
import * as Api from "../utils/Api";
import Immutable from 'seamless-immutable';
import {buildData} from "../utils/DataUtils";
import {InteractionScreen} from "./interactions";
import Screen from "./components/Screen";
import * as Nav from "./Nav";
import {fullName} from "../utils/StringUtils";

type Props = {
    navigator:any,
    style?: any
};

type State = {
};

const FETCH_PEOPLE_YOU_MAY_KNOW = new ApiAction("people_you_may_know");

@connect((state, ownProps) => ({
    peopleYouMayKnow: state.peopleYouMayKnow,
    data: state.data,
}))
export class CommunityScreen extends Screen<Props, State> {

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
                        styles.container,
                        //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                        //this.props.style || Platform.OS === 'ios'? {marginTop: 38} : {}
                    ]
                }
                navigationState={{...this.state, visible: this.isVisible()}}
                renderScene={this.renderScene.bind(this)}
                renderHeader={this.renderHeader.bind(this)}
                onIndexChange={this.handleIndexChange.bind(this)}
            />
        )
    }

    renderFriends() {
        const {navigator} = this.props;
        return (
            <FriendsScreen
                userId={currentUserId()}
                navigator={navigator}
                renderItem={(item) => this.renderItem(item)}
                ListFooterComponent={this.renderFriendsSuggestion.bind(this)}
                style={{backgroundColor: 'white'}}
                //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                // onScreen={this.isVisible()}
                onScreen={true}
            />
        )
    }

    renderInteractions() {
        const {navigator} = this.props;
        return (
            <InteractionScreen
                navigator={navigator}
                onScreen={true}
                //bug: drawer passProps not working [https://github.com/wix/react-native-navigation/issues/663]
                // onScreen={this.isVisible()}
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

    handleIndexChange(index: number) {
        this.setState({ index });
    }

    fetchPeopleYouMayKnow(user_id: Id) {
        console.info("==fetchPeopleYouMayKnow==");
        return new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${user_id}/people_you_may_know`);
    }

    renderHeader(props: *) {
        return <TabBar {...props}
                       indicatorStyle={styles.indicator}
                       style={styles.tabbar}
                       tabStyle={styles.tab}
                       labelStyle={styles.label}/>;
    }

    renderScene({ route }: *) {
        if (route.key === 'friends') {
            return this.renderFriends();
        }
        if (route.key === 'interactions') {
            return this.renderInteractions();
        }
        throw "unexpected"
    };

    renderItem(item: Item) : Node {
        let user = buildData(this.props.data, "users", item.id);
        return (
            <TouchableOpacity onPress={()=> {

                this.props.navigator.showModal({
                    screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
                    title: fullName(user),
                    passProps: {
                        userId: user.id,
                    },
                    navigatorButtons: {
                        leftButtons: [
                            {
                                id: Nav.CLOSE_MODAL,
                                title: "#Cancel"
                            }
                        ],
                    },
                });
            }}>
                <FriendCell friend={user}/>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    indicator: {
        backgroundColor: UIStyles.Colors.green,
    },
    tab: {
        opacity: 1,
    },
    label: {
        color: '#000000',
    },
    tabbar: {
        backgroundColor: 'white',
    },
    indicator: {
        backgroundColor: UIStyles.Colors.green,
    },
    tab: {
        opacity: 1,
        //width: 90,
    },
    label: {
        color: '#000000',
    },
});

export const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action) => {
        return Api.reduceList(state, action, {fetchFirst: FETCH_PEOPLE_YOU_MAY_KNOW});
    }
})();

