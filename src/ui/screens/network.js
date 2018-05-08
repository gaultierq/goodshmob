// @flow

import React from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, TouchableOpacity, View, Text} from 'react-native';
import {connect} from "react-redux";
import {currentUser, currentUserId, logged} from "../../managers/CurrentUser"
import ActivityCell from "../activity/components/ActivityCell";
import {activityFeedProps, floatingButtonScrollListener} from "../UIComponents"
import Feed from "../components/feed"
import type {List, NavigableProps} from "../../types";
import ActionButton from 'react-native-action-button';
import ItemCell from "../components/ItemCell";
import LineupCell from "../components/LineupCell";
import {FETCH_ACTIVITIES, fetchMyNetwork} from "../networkActions";
import * as Nav from "../Nav";
import Screen from "../components/Screen";
import {FEED_INITIAL_LOADER_DURATION, STYLES} from "../UIStyles";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import {mergeItemsAndPendings} from "../../helpers/ModelUtils";
import {CREATE_ASK} from "./ask";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShareButton from "../components/ShareButton";

type Props = NavigableProps;

type State = {
    isActionButtonVisible: boolean
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
                id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                icon: require('../../img2/searchHeaderIcon.png'),
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


    static navigatorStyle = {
        navBarBackgroundColor: Colors.blue
    };

    state = {
        isActionButtonVisible: true
    };

    feed: any

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
        console.debug("network:onNavigatorEvent" , event);
        let navigator = this.props.navigator;

        if (event.id === 'bottomTabReselected' && this.feed) {
                this.feed.scrollToOffset({x: 0, y: 0, animated: true});
        }


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

    //hack to skip the first render
    hasBeenRenderedOnce = false;

    render() {
        if (__ENABLE_PERF_OPTIM__) {
            if (!this.hasBeenRenderedOnce && !this.isVisible()) return null;
            this.hasBeenRenderedOnce = true;
        }


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

        let firstActivityOfFeed = Date.parse(_.get(activities, '0.createdAt'));

        for (let i = 0; i < myAsks.length; i++) {
            let a = myAsks[i];
            if (Date.parse(a.attributes.createdAt) < firstActivityOfFeed) break;
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
            <View style={{flex:1}}>
                <Feed
                    displayName={"network feed"}
                    data={activities}
                    renderItem={this.renderItem.bind(this)}
                    listRef={ref => this.feed = ref}
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
                    empty={<View><Text style={STYLES.empty_message}>{i18n.t('community_screen.empty_screen')}</Text><ShareButton text={i18n.t('actions.invite')}/></View>}
                    {...activityFeedProps()}
                    // initialLoaderDelay={FEED_INITIAL_LOADER_DURATION}
                    initialNumToRender={3}
                    onScroll={floatingButtonScrollListener.call(this)}
                />


                {this.state.isActionButtonVisible && <ActionButton
                    icon={<Icon name="comment-question-outline" size={30} color={Colors.white} style={{paddingTop: 5}}/>}
                    buttonColor={Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />}

            </View>
        );
    }

    navToActivity(activity) {
        this.props.navigator.showModal({
            screen: 'goodsh.ActivityDetailScreen',
            passProps: {activityId: activity.id, activityType: activity.type},
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
            animationType: 'none',

            passProps:{
                onClickClose: () => navigator.dismissModal({animationType: 'none'}),
            },
            backButtonHidden: true,
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
