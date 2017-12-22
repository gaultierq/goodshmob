// @flow

import React from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import ActivityCell from "../activity/components/ActivityCell";
import {MainBackground} from "../UIComponents"
import Feed from "../components/feed"
import type {List, NavigableProps} from "../../types";
import ActionButton from 'react-native-action-button';
import {currentUserId} from "../../managers/CurrentUser";
import ItemCell from "../components/ItemCell";
import LineupCell from "../components/LineupCell";
import {FETCH_ACTIVITIES, fetchMyNetwork} from "../networkActions";
import * as Nav from "../Nav";
import Screen from "../components/Screen";
import {Colors} from "../colors";

type Props = NavigableProps;

type State = {
    isFetchingFirst?: boolean,
    isFetchingMore?: boolean,
    isPulling?: boolean
};

@connect((state, ownProps) => ({
    network: state.network,
    data: state.data,
    activity: state.activity
}))
class NetworkScreen extends Screen<Props, State> {


    static navigatorButtons = {
        rightButtons: [
            {
                //icon: require('../../img/drawer_line_up.png'), // for icon button, provide the local image asset name
                id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                icon: require('../../img2/searchHeaderIcon.png'),
                //title: "#Ask"
            },
        ],
        leftButtons: [
            {
                id: 'community', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                icon: require('../../img2/goodshersHeaderIcon.png'),
                title: "#Community"
            }
        ],
    };

    state = {};

    constructor(props){
        super(props);
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.debug("network:onNavigatorEvent" + JSON.stringify(event));
        let navigator = this.props.navigator;


        switch(event.id) {
            case 'willAppear':
                this.props.navigator.setDrawerEnabled({side: 'right', enabled: true});
                this.props.navigator.setDrawerEnabled({side: 'left', enabled: false});
                break;
            case 'didAppear':

                // this.props.navigator.setDrawerEnabled({side: 'left', enabled: false});
                break;
            case 'willDisappear':
                this.props.navigator.setDrawerEnabled({side: 'right', enabled: false});
                break;
            case 'didDisappear':
                break;
        }


        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'community') { // this is the same id field from the static navigatorButtons definition

                // navigator.toggleDrawer({
                //     side: 'right',
                //     animated: true
                // })


                navigator.showModal({
                    screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
                    title: "#Communauté",
                    passProps:{
                        style: {marginTop: 38},
                    },
                    navigatorButtons: {
                        leftButtons: [
                            {
                                id: Nav.CLOSE_MODAL,
                                title: "#Cancel"
                            }
                        ],
                    },
                });


            }
            // if (event.id === 'ask') {
            //     this.showAsk(navigator);
            // }
            if (event.id === 'search') {
                this.showSearch();
            }

        }
    }


    showAsk() {
        let {navigator} = this.props;

//TODO: rm platform specific rules when [1] is solved.
        //1: https://github.com/wix/react-native-navigation/issues/1502
        let ios = __IS_IOS__;
        let show = ios ? navigator.showLightBox : navigator.showModal;
        let hide = ios ? navigator.dismissLightBox : navigator.dismissModal;
        show({
            screen: 'goodsh.AskScreen', // unique ID registered with Navigation.registerScreen
            style: {
                backgroundBlur: "dark", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
            },
            passProps: {
                containerStyle: {backgroundColor: ios ? 'transparent' : 'white'},
                onClickClose: hide
            },
            navigatorStyle: {navBarHidden: true},
        });
    }

    render() {
        let userId = currentUserId();

        let network = this.props.network[userId] || {};
        let activities = network.list;

        let scrollUpOnBack = super.isVisible() ? ()=> {
            this.props.navigator.switchToTab({
                tabIndex: 0
            });
            return true;
        } : null;

        const factory = (height) => ()=><View style={{height, backgroundColor: 'transparent'}}/>;
        return (
            <MainBackground>
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
                    scrollUpOnBack={scrollUpOnBack}
                    cannotFetch={!super.isVisible()}
                    visibility={super.getVisibility()}
                    ItemSeparatorComponent={factory(50)}
                    ListHeaderComponent={factory(40)()}
                />


                <ActionButton
                    // icon={<Icon name="search" size={30} color={Colors.white} />}
                    buttonColor={Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />

            </MainBackground>
        );
    }

    navToActivity(activity) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "#Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../../img2/headerLogoBlack.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {activityId: activity.id, activityType: activity.type}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
    }

    onFloatingButtonPressed() {
        this.showAsk();
    }


    showSearch() {
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
                    <TouchableOpacity
                        //onPress={handler}
                    >
                        <View>
                            <LineupCell
                                lineup={lineup}
                                //onAddInLineupPressed={this.props.onAddInLineupPressed}
                            />
                        </View>
                    </TouchableOpacity>
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
                    />
                )
            }
        };

        navigator.showModal({
            screen: 'goodsh.NetworkSearchScreen',
            // title: "#Rechercher",
            animationType: 'none',
            backButtonHidden: true,
            passProps:{
                onClickClose: () => navigator.dismissModal({animationType: 'none'}),
            },
            navigatorButtons: {
                leftButtons: [],
                rightButtons: [
                    {
                        id: Nav.CLOSE_MODAL,
                        title: "#Cancel"
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


let screen = NetworkScreen;

export {screen};