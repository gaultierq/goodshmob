// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "./UIComponents";
import build from 'redux-object'
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import SavingCell from "./components/SavingCell";


class SavingsScreen extends Component {

    constructor(){
        super();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        let cui = this.props.lineupId;
        this.props.dispatch(actions.fetchSavings(cui));
    }

    loadMore() {
        //this.props.dispatch(actions.loadMoreFriend());
    }

    render() {
        let savings = this.props.savings;

        let savingList = (savings.list || []).map(object => build(this.props.data, object.type, object.id));

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
                            data={savingList}
                            renderItem={this.renderItem.bind(this)}
                            keyExtractor={(item, index) => item.id}
                            onEndReached={ this.onEndReached.bind(this) }
                            onEndReachedThreshold={0}
                            // ListFooterComponent={(savings.load_more_friend.requesting) &&
                            // <ActivityIndicator
                            //     animating = {savings.load_more_friend.requesting}
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
        return <SavingCell
            onPressItem={() => this.navToSavingDetail(it)}
            savingId={it.id}
        />
    }

    navToSavingDetail(it) {
    }

    onRefresh() {
        this.load();
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
    savings: state.savings,
    data: state.data,
    app: state.app,
    request: state.request
});


const actionTypes = (() => {

    const LOAD_SAVINGS = new Api.ApiAction("load_savings");
    const LOAD_MORE_SAVINGS = new Api.ApiAction("load_more_savings");

    return {LOAD_SAVINGS, LOAD_MORE_SAVINGS};
})();


const actions = (() => {
    return {

        fetchSavings: (lineupId: string) => {
            let call = new Api.Call().withMethod('GET')
                .withRoute(`lists/${lineupId}/savings`)
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "*.*"
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

            return call.disptachForAction(actionTypes.LOAD_MORE_SAVINGS);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_SAVINGS, fetchMore: actionTypes.LOAD_MORE_SAVINGS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(SavingsScreen);

export {reducer, screen};
