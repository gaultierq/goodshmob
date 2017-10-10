// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {connect} from "react-redux";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "./UIComponents";
import build from 'redux-object'
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";


class CommunityScreen extends Component {

    keyExtractor = (item, index) => item.id;


    state: NetworkState;

    constructor(){
        super();
    }

    componentDidMount() {
        this.fetchFirst();
    }

    fetchFirst() {
        let cui = this.props.auth.currentUserId;
        this.props.dispatch(actions.fetchSavings(cui));
    }

    loadMore() {
        //this.props.dispatch(actions.loadMoreFriend());
    }

    render() {
        let friend = this.props.friend;

        let friends = (friend.list || []).map(object => build(this.props.data, object.type, object.id));
        let isLoading = this.props.request.isLoading[actionTypes.LOAD_SAVINGS.name()];

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
        this.fetchFirst();
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
    auth: state.auth,
    request: state.request
});


const actionTypes = (() => {

    const LOAD_FRIENDS = new Api.ApiAction("load_friends");
    const LOAD_MORE_FRIENDS = new Api.ApiAction("load_more_friends");

    return {LOAD_SAVINGS: LOAD_FRIENDS, LOAD_MORE_FRIENDS};
})();


const actions = (() => {
    return {

        fetchSavings: (userId: string) => {
            let call = new Api.Call().withMethod('GET')
                .withRoute(`users/${userId}/friends`)
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actionTypes.LOAD_SAVINGS);
        },
        loadMoreFriend: (nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actionTypes.LOAD_MORE_FRIENDS);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_SAVINGS, fetchMore: actionTypes.LOAD_MORE_FRIENDS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(CommunityScreen);

export {reducer, screen};
