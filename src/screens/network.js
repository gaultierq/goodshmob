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


type NetworkState = {
    isFetchingFirst: boolean,
    isFetchingMore: boolean,
};


//TODO: extract
type NavigableProps = {
    navigagor: any
};


class NetworkScreen extends Component {


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

    props: NavigableProps;



    state: NetworkState;

    keyExtractor = (item, index) => item.id;

    constructor(props){
        super();
        this.state = {isFetchingFirst: false, isFetchingMore: false};
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
        if (this.state.isFetchingFirst) return;
        this.setState({isFetchingFirst: true});
        this.props.dispatch(actions.loadLineups()).then(()=>this.setState({isFetchingFirst: false}));
    }

    loadMore() {
        if (this.state.isFetchingMore) return;
        if (!this.props.network.links) return;
        this.setState({isFetchingMore: true});
        let nextUrl = this.props.network.links.next;
        console.log("Next url:" + nextUrl);

        //data.meta;
        this.props.dispatch(actions.loadMoreLineups(nextUrl)).then(()=>this.setState({isFetchingMore: false}));
    }

    navToActivity(activity) {
        console.info("onPressItem: " + JSON.stringify(activity));
        let passProps = {activityId: activity.id, activityType: activity.type};

        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
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
        let network = this.props.network;

        let activities = network.list ;

        this.checkEmpty(activities);
        if (!isUnique(activities.map((a)=>a.id))) throw new Error(`activities ids not unique 2`);
        if (!isUnique(activities)) throw new Error(`activities not unique`);

        return (
            <MainBackground>
                <View>

                    <FlatList
                        data={activities}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isFetchingFirst}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                        ListFooterComponent={
                            this.state.isFetchingMore && <ActivityIndicator
                                animating={this.state.isFetchingMore}
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
        if (this.props.network.hasMore) {
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
            activityType={it.type}
        />
    }

    onRefresh() {
        this.loadFirst();
    }
}

const mapStateToProps = (state, ownProps) => ({
    network: state.network,
    request: state.request,
    data: state.data,
    activity: state.activity
});


const actiontypes = (() => {
    const FETCH_ACTIVITIES = new Api.ApiAction("home/fetch_activities");
    const FETCH_MORE_ACTIVITIES = new Api.ApiAction("home/fetch_more_activities");

    return {FETCH_ACTIVITIES, FETCH_MORE_ACTIVITIES};
})();


const actions = (() => {
    return {
        loadLineups: () => {
            let call = new Api.Call().withMethod('GET')
                .withRoute("activities")
                .withQuery({include: "user,resource,target"});

            return call.disptachForAction2(actiontypes.FETCH_ACTIVITIES);
        },

        loadMoreLineups:(nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({include: "user,resource,target"});

            return call.disptachForAction2(actiontypes.FETCH_MORE_ACTIVITIES);
        }
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