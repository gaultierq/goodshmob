// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, TouchableWithoutFeedback, View} from 'react-native';
import {connect} from "react-redux";
import ActivityCell from "../activity/components/ActivityCell";
import * as UIStyles from "./UIStyles"
import {MainBackground} from "./UIComponents"
import Feed from "./components/feed"
import type {Ask, List, NavigableProps} from "../types";
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import {currentUserId} from "../CurrentUser";
import ItemCell from "./components/ItemCell";
import LineupCell from "./components/LineupCell";
import {FETCH_ACTIVITIES, fetchMyNetwork} from "./networkActions";
import * as Nav from "./Nav";


type Props = NavigableProps;

type State = {
    isFetchingFirst?: boolean,
    isFetchingMore?: boolean,
    isPulling?: boolean
};

class NetworkScreen extends Component<Props, State> {


    static navigatorStyle = UIStyles.NavStyles;

    static navigatorButtons = {
        leftButtons: [
            {
                //icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
                id: 'ask', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                icon: require('../img/bottom_bar_ask.png'),
                title: "Ask"
            }
        ],
        rightButtons: [
            {
                id: 'community', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                icon: require('../img/drawer_community.png'),
                title: "Community"
            }
        ],
    };

    state = {};

    constructor(props){
        super();
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        let navigator = this.props.navigator;

        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'community') { // this is the same id field from the static navigatorButtons definition

                navigator.toggleDrawer({
                    side: 'right',
                    animated: true
                })
            }
            if (event.id === 'ask') {
                //TODO: rm platform specific rules when [1] is solved.
                //1: https://github.com/wix/react-native-navigation/issues/1502
                let ios = Platform.OS === 'ios';
                let show = ios ? navigator.showLightBox : navigator.showModal;
                let hide = ios ? navigator.dismissLightBox : navigator.dismissModal;
                show({
                    screen: 'goodsh.AskScreen', // unique ID registered with Navigation.registerScreen
                    style: {
                        backgroundBlur: "dark", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                        tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
                    },
                    passProps:{
                        containerStyle: {backgroundColor: ios ? 'transparent' : 'white'},
                        onClickClose: hide
                    },
                    navigatorStyle: {navBarHidden: true},
                });
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
        let userId = currentUserId();

        let network = this.props.network[userId] || {};
        let activities = network.list;

        return (
            <MainBackground>
                <View>
                    <Feed
                        data={activities}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory: fetchMyNetwork,
                            useLinks: true,
                            action: FETCH_ACTIVITIES,
                            options: {userId}
                        }}
                        hasMore={!network.hasNoMore}
                    />

                </View>

                <ActionButton
                    icon={<Icon name="search" size={30} color={UIStyles.Colors.white} />}
                    buttonColor={UIStyles.Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />

            </MainBackground>
        );
    }

    onFloatingButtonPressed() {
        let navigator = this.props.navigator;


        const queries = [
            {
                indexName: 'Saving_staging',
                params: {
                    facets: "[\"list_name\"]",
                    filters: 'user_id:' + currentUserId(),
                }
            }
        ];

        let renderItem = ({item})=> {

            let isLineup = item.type === 'lists';

            //FIXME: item can be from search, and not yet in redux store
            //item = buildData(this.props.data, item.type, item.id) || item;

            //if (!item) return null;

            if (isLineup) {
                let lineup: List = item;
                //let handler = this.props.onLineupPressed ? () => this.props.onLineupPressed(item) : null;
                return (
                    <TouchableWithoutFeedback
                        //onPress={handler}
                    >
                        <View>
                            <LineupCell
                                lineup={lineup}
                                //onAddInLineupPressed={this.props.onAddInLineupPressed}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                )
            }
            else {
                let saving = item;

                let resource = saving.resource;

                //TODO: this is hack
                if (!resource) return null;

                return (
                    <ItemCell
                        item={resource}
                        //onPressItem={()=>this.props.onSavingPressed(saving)}
                    />
                )
            }
        };

        navigator.showModal({
            screen: 'goodsh.NetworkSearchScreen', // unique ID registered with Navigation.registerScreen
            title: "Rechercher", // navigation bar title of the pushed screen (optional)
            passProps:{
                onClickClose: () => navigator.dismissModal(),
                queries,
                renderItem
            },
            navigatorButtons: {
                leftButtons: [
                    {
                        id: Nav.CANCEL,
                        title: "Cancel"
                    }
                ],
            },
        });
    }

    static checkEmpty(activities) {
        let empty = activities.filter((elem, index, self) => {
            return typeof elem === 'undefined';
        });
        if (empty.length > 0) throw new Error(`empty activities found`);
    }


    renderItem({item}) {

        return (
            <ActivityCell
                onPressItem={() => this.navToActivity(item)}
                activityId={item.id}
                activityType={item.type}
                navigator={this.props.navigator}
            />
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    network: state.network,
    data: state.data,
    activity: state.activity
});


let screen = connect(mapStateToProps)(NetworkScreen);

export {screen};