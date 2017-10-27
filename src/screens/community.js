// @flow

import React, {Component} from 'react';
import type {Node} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import type {Id, Item, User} from "../types";
import FriendsScreen from "./friends";
import FriendCell from "./components/FriendCell";

type Props = {
    userId: Id,
    data?: any,
    navigator:any
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@connect(mapStateToProps)
export default class CommunityScreen extends Component<Props, State> {

    render() {
        const {navigator, userId} = this.props;

        return (
            <FriendsScreen
                userId={userId}
                navigator={navigator}
                renderItem={(item) => this.renderItem(item)}
            />
        )
    }

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

