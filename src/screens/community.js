// @flow

import React, {Component} from 'react';
import type {Node} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import type {Id, Item, User} from "../types";
import FriendsScreen from "./friends";
import FriendCell from "./components/FriendCell";
import {currentUserId} from "../CurrentUser";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import * as UIStyles from "./UIStyles";
import i18n from '../i18n/i18n'

type Props = {
    navigator:any
};

type State = {
};


@connect()
export default class CommunityScreen extends Component<Props, State> {

    state = {
        index: 0,
        routes: [
            {key: `friends`, title: i18n.t("community_screen.tabs.friends")},
            {key: `notifications`, title: i18n.t("community_screen.tabs.notifications")}
        ],
    };

    render() {
        return (
            <TabViewAnimated
                style={styles.container}
                navigationState={this.state}
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
            />
        )
    }

    handleIndexChange(index: number) {
        this.setState({ index });
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
        return null
    };

    renderItem(item: Item) : Node {
        const {onPressItem} = this.props;
        return (
            <TouchableOpacity
                onPress={onPressItem}>
                <FriendCell
                    friend={item}
                    onPressItem={this.props.onPressItem}
                />
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