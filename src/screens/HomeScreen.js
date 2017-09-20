// @flow

import React, {Component} from 'react';
import {StyleSheet, View, FlatList, ImageBackground, RefreshControl, ActivityIndicator} from 'react-native';
import {connect} from "react-redux";
import ActivityCell from "../activity/components/ActivityCell";
import * as UI from "./UIStyles"
import  * as activitesActions from '../activities/actions'

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

    static navigatorStyle = UI.NavStyles;

    keyExtractor = (item, index) => item.id;


    state: {
        loadingFirst: boolean;
        loadingMore: boolean;
        loadedOnce: boolean;
    };


    constructor(props){
        super();
        this.state = {loadingFirst: false, loadingMore: false, loadedOnce: false};
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

    loadMore() {
        if (this.state.loadingMore) return;
        this.setState({loadingMore: true});

        if (!this.props.activities.links) return;
        let nextUrl = this.props.activities.links.next;
        console.log("Next url:" + nextUrl);
        this.props.dispatch(activitesActions.fetchMoreActivities(nextUrl, () => {
            this.setState({loadingMore: false});
        }));
    }

    loadFirst() {
        if (this.state.loadingFirst) return;
        this.setState({loadingFirst: true});

        this.props.dispatch(activitesActions.fetchActivities(
            ()=> {
                this.setState({loadingFirst: false, loadedOnce: true});
            }));
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
        let activities = this.props.activities.activities || [];

        return (
            <ImageBackground
                source={require('../img/home_background.png')}
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                }}
            >

                <View style={{
                }}>
                    <ActivityIndicator
                        animating = {!this.state.loadedOnce && this.state.loadingFirst}
                        size = "large"
                    />

                    <FlatList
                        data={activities}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loadingFirst}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                    />

                    <ActivityIndicator
                        animating = {this.state.loadingMore}
                        size = "small"
                    />

                </View>

            </ImageBackground>
        );
    }

    onEndReached() {
        if (this.props.activities.hasMore) {
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
            activity={it}
        />
    }

    onRefresh() {
        this.setState({loadingFirst: true});
        this.loadFirst();
    }
}


const mapStateToProps = (state, ownProps) => ({
    activities: state.activities,
});


export default connect(mapStateToProps)(HomeScreen);