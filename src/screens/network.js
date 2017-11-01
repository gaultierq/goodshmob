// @flow

import React, {Component} from 'react';
import {View, FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {connect} from "react-redux";
import ActivityCell from "../activity/components/ActivityCell";
import * as UIStyles from "./UIStyles"
import {MainBackground} from "./UIComponents"

import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import {isUnique} from "../utils/ArrayUtil";
import Feed from "./components/feed"
import ApiAction from "../utils/ApiAction";
import type {NavigableProps} from "../types";

type FeedState = {
    isFetchingFirst: boolean,
    isFetchingMore: boolean,
    isPulling: boolean
};

type NetworkState = {
} & FeedState;

class NetworkScreen extends Component {


    static navigatorButtons = {
        // rightButtons: [
        //     {
        //         icon: require('../img/drawer_community.png'), // for icon button, provide the local image asset name
        //         id: 'community' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
        //     }
        // ],
        // rightButtons: [
        //     {
        //         icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
        //         id: 'line_up' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
        //     }
        // ],
    };

    static navigatorStyle = UIStyles.NavStyles;

    props: NavigableProps;

    state: NetworkState;

    constructor(props){
        super();
        this.state = {isFetchingFirst: false, isFetchingMore: false};
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            // if (event.id === 'line_up') { // this is the same id field from the static navigatorButtons definition
            //     this.props.navigator.toggleDrawer({
            //         side: 'right',
            //         animated: true
            //     })
            // }
            if (event.id === 'community') { // this is the same id field from the static navigatorButtons definition
                this.props.navigator.toggleDrawer({
                    side: 'right',
                    animated: true
                })
            }
        }
    }

    navToActivity(activity) {
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

    render() {
        let network = this.props.network;

        let activities = network.list;

        NetworkScreen.checkEmpty(activities);
        if (!isUnique(activities.map((a)=>a.id))) throw new Error(`activities ids not unique 2`);
        if (!isUnique(activities)) throw new Error(`activities not unique`);

        return (
            <MainBackground>
                <View>
                    <Feed
                        data={activities}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory:actions.fetchActivities,
                            action:actiontypes.FETCH_ACTIVITIES
                        }}
                        hasMore={!this.props.network.hasNoMore}
                    />
                </View>

            </MainBackground>
        );
    }

    static checkEmpty(activities) {
        let empty = activities.filter((elem, index, self) => {
            return typeof elem === 'undefined';
        });
        if (empty.length > 0) throw new Error(`empty activities found`);
    }


    renderItem(item) {

        let it = item.item;
        return (
            <ActivityCell
                onPressItem={() => this.navToActivity(it)}
                activityId={it.id}
                activityType={it.type}
                navigator={this.props.navigator}
            />
        )
    }

}

const mapStateToProps = (state, ownProps) => ({
    network: state.network,
    request: state.request,
    data: state.data,
    activity: state.activity
});


const actiontypes = (() => {
    const FETCH_ACTIVITIES = new ApiAction("home/fetch_activities");

    return {FETCH_ACTIVITIES};
})();


const actions = (() => {
    return {
        fetchActivities: () => {
            let call = new Api.Call().withMethod('GET')
                .withRoute("activities")
                .addQuery({include: "user,resource,target"});

            return call;
        },

    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actiontypes.FETCH_ACTIVITIES, fetchMore: actiontypes.FETCH_MORE_ACTIVITIES};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(NetworkScreen);

export {reducer, screen};