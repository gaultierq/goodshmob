// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "../screens/UIComponents";
import build from 'redux-object'
import * as types from './actionTypes';

class CommunityScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        let cui = this.props.app.currentUser.id;
        this.props.dispatch(actions.loadFriend(cui));
    }

    loadMore() {
        //this.props.dispatch(actions.loadMoreFriend());
    }

    render() {
        let friend = this.props.friend;

        let friends = (friend.list || []).map(object => build(this.props.data, object.type, object.id));
        let isLoading = this.props.request.isLoading[types.LOAD_FRIENDS.name()];

        return (
            <MainBackground>
            <ScrollView>
                <View style={styles.container}>
                    {isLoading && <ActivityIndicator
                        animating = {isLoading}
                        size = "large"
                    />}

                    <FlatList
                        data={friends}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                        // ListFooterComponent={(friend.load_more_friend.requesting) &&
                        // <ActivityIndicator
                        //     animating = {friend.load_more_friend.requesting}
                        //     size = "small"
                        // />}
                    />
                </View>
            </ScrollView>
            </MainBackground>
        );
    }


    renderItem(item) {
        let it = item.item;
        return <FriendCell
            onPressItem={() => this.navToFriendDetail(it)}
            friend={it}
        />
    }

    navToFriendDetail(it) {
    }


    onRefresh() {
        this.loadFirst();
    }

    onEndReached() {
        if (this.props.friend.hasMore) {
            this.loadMore();
        }
        else {
            console.info("end of feed")
        }

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    friend: state.friend,
    data: state.data,
    app: state.app,
    request: state.request
});

export default connect(mapStateToProps)(CommunityScreen);