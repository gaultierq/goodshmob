// @flow

import React from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {currentUser, currentUserId, logged} from "../../managers/CurrentUser"
import ActivityCell from "../activity/components/ActivityCell";
import {activityFeedProps} from "../UIComponents"
import Feed from "../components/feed"
import type {List, NavigableProps} from "../../types";
import ActionButton from 'react-native-action-button';
import ItemCell from "../components/ItemCell";
import LineupCell from "../components/LineupCell";
import {FETCH_ACTIVITIES, fetchMyNetwork} from "../networkActions";
import * as Nav from "../Nav";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import {mergeItemsAndPendings} from "../../helpers/ModelUtils";
import {CREATE_ASK} from "./ask";

type Props = NavigableProps;

type State = {
    isFetchingFirst?: boolean,
    isFetchingMore?: boolean,
    isPulling?: boolean
};

@logged
@connect((state, ownProps) => ({
    network: state.network,
    data: state.data,
    pending: state.pending,
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
                title: i18n.t("home_search_screen.community.title")
            }
        ],
    };

    state = {};

    constructor(props){
        super(props);
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentWillAppear() {
        this.props.navigator.setDrawerEnabled({side: 'right', enabled: true});
        this.props.navigator.setDrawerEnabled({side: 'left', enabled: false});
    }

    componentWillDisappear() {
        this.props.navigator.setDrawerEnabled({side: 'right', enabled: false});
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.debug("network:onNavigatorEvent" + JSON.stringify(event));
        let navigator = this.props.navigator;


        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'community') { // this is the same id field from the static navigatorButtons definition

                navigator.showModal({
                    screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
                    title: i18n.t("home_search_screen.community.title"),
                    passProps:{
                        style: {marginTop: 38},
                    },
                    navigatorButtons: Nav.CANCELABLE_MODAL,
                });
            }
            if (event.id === 'search') {
                this.showSearch();
            }
        }
    }


    showAsk() {
        let {navigator} = this.props;

//TODO: rm platform specific rules when [1] is solved.
        //1: https://github.com/wix/react-native-navigation/issues/1502
        navigator.showModal({
            screen: 'goodsh.AskScreen', // unique ID registered with Navigation.registerScreen
            animationType: 'none'
        });
    }

    render() {
        let userId = currentUserId();

        let network = this.props.network[userId] || {};
        let activities = _.slice(network.list);

        //take all my asks
        //oder by date

        let myAsks = _.transform(
            this.props.data.asks,
            (asks, value) => {
                if (value.relationships.user.data.id === userId) {
                    asks.push(value);
                }
            }, []);

        myAsks = _.orderBy(myAsks, 'attributes.createdAt', 'asc');

        let firstActivityOfFeed = _.get(activities, '0.attributes.createdAt');

        for (let i = 0; i < myAsks.length; i++) {
            let a = myAsks[i];
            if (a.attributes.createdAt < firstActivityOfFeed) break;
            activities.unshift({id: a.id, type: 'asks'});
        }

        //FIXME: remove dep to ask
        activities = mergeItemsAndPendings(
            activities,
            this.props.pending[CREATE_ASK],
            [],
            (pending) => ({
                id: pending.id,
                content: pending.payload.content,
                createdAt: pending.insertedAt,
                user: currentUser(),
                type: 'asks',
                pending: true
            })
        );



        let scrollUpOnBack = super.isVisible() ? ()=> {
            this.props.navigator.switchToTab({
                tabIndex: 0
            });
            return true;
        } : null;

        return (
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
                    scrollUpOnBack={scrollUpOnBack}
                    cannotFetch={!super.isVisible()}
                    visibility={super.getVisibility()}
                    // ItemSeparatorComponent={TRANSPARENT_SPACER(50)}
                    // ListHeaderComponent={TRANSPARENT_SPACER(40)()}
                    // style={{backgroundColor: Colors.dirtyWhite}}
                    {...activityFeedProps()}
                />


                <ActionButton
                    // icon={<Icon name="search" size={30} color={Colors.white} />}
                    buttonColor={Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />

            </View>
        );
    }

    navToActivity(activity) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: i18n.t("home_search_screen.saving.title"), // navigation bar title of the pushed screen (optional)
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
                    <GTouchable
                        //onPress={handler}
                    >
                        <View>
                            <LineupCell
                                lineup={lineup}
                                //onAddInLineupPressed={this.props.onAddInLineupPressed}
                            />
                        </View>
                    </GTouchable>
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
                        title: i18n.t("actions.cancel")
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
                activity={item.pending ? item : null}
                activityId={item.id}
                activityType={item.type}
                navigator={this.props.navigator}
            />
        )
    }
}

let screen = NetworkScreen;

export {screen};
