// @flow

import React from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import ActivityCell from "../activity/components/ActivityCell";
import {activityFeedProps, floatingButtonScrollListener} from "../UIComponents"
import Feed from "../components/feed"
import type {Activity, ActivityGroup, Id, NavigableProps} from "../../types";
import ActionButton from 'react-native-action-button';
import {FETCH_ACTIVITIES, fetchMyNetwork} from "../networkActions";
import * as Nav from "../Nav";
import Screen from "../components/Screen";
import {renderSimpleButton, STYLES} from "../UIStyles";
import {Colors} from "../colors";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShareButton from "../components/ShareButton";
import {Call} from "../../managers/Api";
import {buildData} from "../../helpers/DataUtils";

type Props = NavigableProps;

type State = {
    isActionButtonVisible: boolean
};

type NetworkSection = {
    id: Id,
    activityCount: number,
    data: Array<any>
}

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

    constructor(props: Props){
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
    // hasBeenRenderedOnce = false;


    render() {

        const {network, data, navigator, ...attr} = this.props

        let userId = currentUserId();

        let network1 = network[userId] || {list: []}
        let sections = network1.list
            .map(group => buildData(data, 'activityGroups', group.id))
            .map(built => ({
                id: built.id,
                activityCount: built.activityCount,
                data: built.activities
            }))


        let scrollUpOnBack = super.isVisible() ? ()=> {
            navigator.switchToTab({
                tabIndex: 0
            });
            return true;
        } : null;

        return (
            <View style={{flex:1}}>
                <Feed
                    displayName={"Network"}
                    sections={sections}
                    renderItem={({item}) => this.renderItem(item)}
                    renderSectionFooter={({section}) => this.renderSectionFooter(section)}
                    listRef={ref => this.feed = ref}
                    fetchSrc={{
                        callFactory: fetchMyNetwork,
                        // useLinks: true,
                        action: FETCH_ACTIVITIES,
                        options: {userId}
                    }}
                    hasMore={!network1.hasNoMore}
                    scrollUpOnBack={scrollUpOnBack}
                    visibility={super.getVisibility()}
                    empty={<View><Text style={STYLES.empty_message}>{i18n.t('community_screen.empty_screen')}</Text><ShareButton text={i18n.t('actions.invite')}/></View>}
                    {...activityFeedProps()}
                    // initialLoaderDelay={FEED_INITIAL_LOADER_DURATION}
                    initialNumToRender={3}
                    onScroll={floatingButtonScrollListener.call(this)}
                    decorateLoadMoreCall={(last: ActivityGroup, call: Call) => call.addQuery({id_lt: last.id})
                    }
                    visibility={super.getVisibility()}
                    {...attr}
                />


                {this.state.isActionButtonVisible && <ActionButton
                    icon={<Icon name="comment-question-outline" size={30} color={Colors.white} style={{paddingTop: 5}}/>}
                    buttonColor={Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />}

            </View>
        );
    }

    renderSectionFooter(section: NetworkSection) {
        return (

            renderSimpleButton(
                i18n.t('load_more_activities', {count: section.activityCount - section.data.length}),
                ()=> this.loadMore(section),
                // {loading: reqState === 'sending', disabled: ok, textStyle: {fontWeight: "normal", fontSize: 14, color: Colors.grey}}
            )
        )
    }

    loadMore(section: NetworkSection) {
        this.props.dispatch(fetchMyNetwork({limit: 1, activity_by_group: section.activityCount, id_lte: section.id}).createActionDispatchee(FETCH_ACTIVITIES, {userId: currentUserId()}))
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

    renderItem(activity: Activity) {
        return (
            <ActivityCell
                onPressItem={() => this.navToActivity(activity)}
                activity={activity.pending ? activity : null}
                activityId={activity.id}
                activityType={activity.type}
                navigator={this.props.navigator}
            />
        )
    }
}

let screen = NetworkScreen;

export {screen};
