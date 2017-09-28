// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl, TouchableHighlight} from 'react-native';
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import LineupCell from "./components/LineupCell";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";



class LineupListScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.props.dispatch(actions.loadLineups());
    }

    loadMore() {
        if (this.isLoadingMore()) return;
        if (!this.props.lineupList.links) return;
        let nextUrl = this.props.lineupList.links.next;
        console.log("Next url:" + nextUrl);

        //data.meta;
        this.props.dispatch(actions.loadMoreLineups(nextUrl));
    }

    render() {
        let lineupList = this.props.lineupList;

        let lineups = lineupList.list;

        return (
            <MainBackground>
                <ScrollView>
                    <View style={styles.container}>
                        <FlatList
                            data={lineups}
                            renderItem={this.renderItem.bind(this)}
                            keyExtractor={this.keyExtractor}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.isLoading()}
                                    onRefresh={this.onRefresh.bind(this)}
                                />
                            }
                            onEndReached={ this.onEndReached.bind(this) }
                            onEndReachedThreshold={0}
                            ListFooterComponent={this.isLoadingMore() &&

                            <ActivityIndicator
                                animating = {this.isLoadingMore()}
                                size = "small"
                            />}
                        />
                    </View>
                </ScrollView>
            </MainBackground>
        );
    }


    isLoadingMore() {
        return !!this.props.request.isLoading[actiontypes.FETCH_MORE_LINEUPS.name()];
    }

    isLoading() {
        return !!this.props.request.isLoading[actiontypes.FETCH_LINEUPS.name()];
    }


    renderItem(item) {
        let it = item.item;
        return <TouchableHighlight onPress={() => this.seeLineupDetails(it)}>
            <View>
                <LineupCell
                    onPressItem={() => this.navToLineupDetail(it)}
                    lineupId={it.id}
                />
            </View>
        </TouchableHighlight>
    }

    seeLineupDetails(lineup) {
        console.info("onPressItem: " + JSON.stringify(lineup));
        this.props.navigator.push({
            screen: 'goodsh.LineupDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "Lineup Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {lineupId: lineup.id}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
    }


    onRefresh() {
        this.loadFirst();
    }

    onEndReached() {
        if (this.props.lineupList.hasMore) {
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
    lineupList: state.lineupList,
    request: state.request
});

const actiontypes = (() => {
    const FETCH_LINEUPS = new Api.ApiAction("fetch_lineups");
    const FETCH_MORE_LINEUPS = new Api.ApiAction("fetch_more_lineups");

    return {FETCH_LINEUPS, FETCH_MORE_LINEUPS};
})();


const actions = (() => {
    return {
        loadLineups: () => {
            let call = new Api.Call().withMethod('GET')
                .withRoute("lists")
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actiontypes.FETCH_LINEUPS);
        },

        loadMoreLineups:(nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actiontypes.FETCH_MORE_LINEUPS);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actiontypes.FETCH_LINEUPS, fetchMore: actiontypes.FETCH_MORE_LINEUPS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(LineupListScreen);

export {reducer, screen};