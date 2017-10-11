// @flow

import React, {Component} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import build from 'redux-object'
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import ItemCell from "./components/ItemCell";
import Feed from "./components/feed";
import Swipeout from 'react-native-swipeout';
import type * as types from "../types";
import {buildNonNullData} from "../utils/DataUtils";
import CurrentUser from  "../CurrentUser"

class SavingsScreen extends Component {

    props : {
        lineupId: string
    };

    componentWillMount() {
        this.lineup = this.getLineup();
    }

    render() {

        let savingList = this.lineup.savings.map((s)=>s.resource);

        return (
            <MainBackground>
                <View style={styles.container}>
                    <Feed
                        data={savingList}
                        renderItem={this.renderItem.bind(this)}
                        fetchAction={()=>actions.loadSavings(this.props.lineupId)}
                        fetchMoreAction={actions.loadMoreSavings}
                    />

                </View>
            </MainBackground>
        );
    }

    getLineup() {
        return buildNonNullData(this.props.data, "lists", this.props.lineupId);
    }

    renderItem(item) {
        let it = item.item;
        let saving = this.lineup.savings.filter((sav)=>sav.resource.id === it.id)[0];

        let disabled = this.lineup.user.id !== CurrentUser.id;

        let swipeBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
            onPress: () => { this.deleteSaving(saving) }
        }];

        return (
            <Swipeout right={swipeBtns}
                      autoClose='true'
                      backgroundColor= 'transparent'
                      disabled={disabled}
            >

                <ItemCell
                    onPressItem={() => this.navToSavingDetail(saving)}
                    item={it}
                    navigator={this.props.navigator}
                />
            </Swipeout>)
    }

    deleteSaving(saving) {
        this.props.dispatch(actions.deleteSaving(saving));
    }

    navToSavingDetail(saving) {
        let activity = saving;


        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {activityId: activity.id, activityType: activity.type}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
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
    const DELETE_SAVING = new Api.ApiAction("delete_saving");

    return {LOAD_SAVINGS, LOAD_MORE_SAVINGS, DELETE_SAVING};
})();


const actions = (() => {
    return {

        loadSavings: (lineupId: string) => {
            let call = new Api.Call().withMethod('GET')
                .withRoute(`lists/${lineupId}/savings`)
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "*.*"
                });

            return call.disptachForAction(actionTypes.LOAD_SAVINGS);
        },
        loadMoreSavings: (nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actionTypes.LOAD_MORE_SAVINGS);
        },
        deleteSaving: (saving:types.Saving) => {
            let call = new Api.Call()
                .withMethod('DELETE')
                .withRoute(`savings/${saving.id}`);

            return call.disptachForAction2(actionTypes.DELETE_SAVING);
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
