// @flow

import React, {Component} from 'react';
import {StyleSheet, View, FlatList, ImageBackground, RefreshControl, ActivityIndicator} from 'react-native';
import {connect} from "react-redux";
import ActivityCell from "../activity/components/ActivityCell";
import * as UIStyles from "./UIStyles"
import {MainBackground} from "./UIComponents"
import  * as activitesActions from '../home/actions'
import {isUnique} from "../utils/ArrayUtil";

class HomeScreen extends Component {

    static navigatorButtons = {
        leftButtons: [
            {
                icon: require('../img/drawer_community.png'), // for icon button, provide the local image asset name
                id: 'community' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
            }
        ],
        rightButtons: [
            {
                icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
                id: 'line_up' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
            }
        ],
    };

    static navigatorStyle = UIStyles.NavStyles;

    keyExtractor = (item, index) => item.id;

    constructor(props){
        super();
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'line_up') { // this is the same id field from the static navigatorButtons definition
                this.props.navigator.toggleDrawer({
                    side: 'right',
                    animated: true
                })
            }
            if (event.id === 'community') { // this is the same id field from the static navigatorButtons definition
                this.props.navigator.toggleDrawer({
                    side: 'left',
                    animated: true
                })
            }
        }
    }

    componentDidMount() {
        this.loadFirst();
    }

    loadFirst() {
        if (this.props.home.load_feed.requesting) return;
        this.props.dispatch(activitesActions.loadFeed());
    }

    loadMore() {
        if (this.props.home.load_more_feed.requesting) return;
        if (!this.props.home.links) return;
        let nextUrl = this.props.home.links.next;
        console.log("Next url:" + nextUrl);
        this.props.dispatch(activitesActions.loadMoreFeed(nextUrl));
    }

    navToActivity(activity) {
        console.info("onPressItem: " + JSON.stringify(activity));
        let passProps = {activityId: activity.id, activityType: activity.type};

        this.props.navigator.push({
            screen: 'goodsh.ActivityScreen', // unique ID registered with Navigation.registerScreen
            title: "Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: passProps, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
    }

    render() {
        let home = this.props.home;
        let activities = home.feed.ids.map((id) => {
            let activity = this.props.activity.all[id];
            if (!activity) throw new Error("no activity found for id="+id);
            return activity;
        });

        this.checkEmpty(activities);
        if (!isUnique(home.feed.ids)) throw new Error(`activities ids not unique`);
        if (!isUnique(activities.map((a)=>a.id))) throw new Error(`activities ids not unique 2`);
        if (!isUnique(activities)) throw new Error(`activities not unique`);

        return (
            <MainBackground>
                <View>
                    {/* empty */}
                    {!home.feed.loaded && <ActivityIndicator
                        animating = {!home.feed.loaded}
                        size = "large"
                    />}

                    <FlatList
                        data={activities}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        refreshControl={
                            <RefreshControl
                                refreshing={!!home.load_feed.loaded && home.load_feed.requesting}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                        ListFooterComponent={(home.load_more_feed.requesting) &&

                        <ActivityIndicator
                            animating = {home.load_more_feed.requesting}
                            size = "small"
                        />}
                    />
                </View>

            </MainBackground>
        );
    }

    checkEmpty(activities) {
        let empty = activities.filter((elem, index, self) => {
            return typeof elem === 'undefined';
        });
        if (empty.length > 0) throw new Error(`empty activities found`);
    }


    onEndReached() {
        if (this.props.home.hasMore) {
            this.loadMore();
        }
        else {
            console.info("end of feed")
        }

    }

    renderItem(item) {

        let it = item.item;
        return <ActivityCell
            onPressItem={() => this.navToActivity(it)}
            activityId={it.id}
        />
    }

    onRefresh() {
        this.loadFirst();
    }
}

const mapStateToProps = (state, ownProps) => ({
    home: state.home,
    activity: state.activity
});


export default connect(mapStateToProps)(HomeScreen);