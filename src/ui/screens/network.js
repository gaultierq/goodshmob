// @flow

import React from 'react'
import {
    ActivityIndicator, Dimensions, FlatList, Platform, RefreshControl, Text,
    TouchableOpacity, View
} from 'react-native'
import {connect} from "react-redux"
import {currentUser, currentUserId, logged} from "../../managers/CurrentUser"
import ActivityCell from "../activity/components/ActivityCell"
import {scheduleOpacityAnimation, TRANSPARENT_SPACER} from "../UIComponents"
import Feed from "../components/feed"
import type {Activity, Id, NavigableProps} from "../../types"
import {FETCH_ACTIVITIES, fetchMyNetwork} from "../networkActions"
import * as Nav from "../Nav"
import {CANCELABLE_MODAL2, seeActivityDetails} from "../Nav"
import Screen from "../components/Screen"
import {LINEUP_PADDING, renderSimpleButton, STYLES} from "../UIStyles"
import {Colors} from "../colors"
import AppShareButton from "../components/AppShareButton"
import {Call, safeDispatchAction} from "../../managers/Api"
import {buildData} from "../../helpers/DataUtils"
import ActivityStatus from "../activity/components/ActivityStatus"
import {SFP_TEXT_MEDIUM} from "../fonts"
import AskInput from "../components/AskInput"
import GTouchable from "../GTouchable"
import * as UI from "../UIStyles"

type Props = NavigableProps;

type State = {
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
    activity: state.saving
}))
class NetworkScreen extends Screen<Props, State> {

    static navigatorButtons = {
        rightButtons: [

            {
                id: 'interactions',
                icon: require('../../img2/bell.png'),
                // title: i18n.t("home_search_screen.community.title")
            },
        ],
        leftButtons: [

            {
                id: 'friends',
                icon: require('../../img2/add-user.png'),
                // title: i18n.t("home_search_screen.community.title")
            }
        ],
    };


    static navigatorStyle = {
        navBarBackgroundColor: Colors.blue
    };

    state = {
    };

    feed: any

    lastRenderedLength: ?number

    constructor(props: Props){
        super(props);
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentDidMount() {
        // const {height, width} = Dimensions.get('window');

        // this.props.navigator.setStyle({
        //     ...UI.NavStyles,
        //     navBarCustomView: 'goodsh.TouchableSearchBar',
        //     navBarCustomViewInitialProps: {
        //         style: {
        //             width: width - 130,
        //             marginTop: __IS_IOS__ ? 0 : 10,
        //         },
        //         searchBarProps: {
        //             placeholder: i18n.t('search.in_network')
        //         },
        //         onPress: this.showSearch.bind(this)
        //     }
        // });
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

        if (__IS_IOS__ && event.id === 'bottomTabReselected' && this.feed) {
            //__IS_IOS__ because of: scrollToIndex should be used in conjunction with getItemLayout or onScrollToIndexFailed
            // this.feed.scrollToOffset({x: 0, y: 0, animated: true});
            if (this.lastRenderedLength && this.lastRenderedLength > 0) {
                this.feed.scrollToLocation({sectionIndex: 0, itemIndex: 0, viewOffset: 50})
            }

        }

        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'interactions') { // this is the same id field from the static navigatorButtons definition

                navigator.showModal({
                    screen: 'goodsh.InteractionScreen', // unique ID registered with Navigation.registerScreen
                    title: i18n.t("community.screens.notifications"),
                    passProps:{
                        style: {marginTop: 38},
                    },
                    navigatorButtons: Nav.CANCELABLE_MODAL,
                });
            }

            if (event.id === 'friends') {
                navigator.showModal({
                    screen: 'goodsh.Community',
                    title: i18n.t("community.screens.friends"),
                    // passProps:{
                    //     userId: currentUserId(),
                    // },
                    navigatorButtons: {
                        ...Nav.CANCELABLE_MODAL,
                        // rightButtons: [
                        //
                        //     {
                        //         id: 'friendsSearch',
                        //         icon: require('../../img2/searchHeaderIcon.png'),
                        //     },
                        // ]
                    }
                });
            }
        }
    }

    render() {

        const {network, data, navigator, ...attr} = this.props

        let userId = currentUserId();

        let network1 = network[userId] || {list: []}
        let sections = network1.list
            .map(group => buildData(data, 'activityGroups', group.id))
            .map(built => (built && {
                id: built.id,
                activityCount: built.activityCount,
                data: built.activities
            }))
            .filter(v => !!v)


        let scrollUpOnBack = super.isVisible() ? ()=> {
            navigator.switchToTab({
                tabIndex: 0
            });
            return true;
        } : null;

        this.lastRenderedLength = sections.length

        let fc = _.get(currentUser(), 'meta.friendsCount')

        return (
            <View style={{flex:1}}>
                <Feed
                    displayName={"Network"}
                    sections={sections}
                    renderItem={({item, index}) => this.renderItem(item, index)}
                    renderSectionFooter={({section}) => this.renderSectionFooter(section)}
                    ListHeaderComponent={fc !== 0 && this.renderAskInput()}
                    listRef={ref => this.feed = ref}
                    fetchSrc={{
                        callFactory: fetchMyNetwork,
                        // useLinks: true,
                        action: FETCH_ACTIVITIES,
                        options: {userId}
                    }}
                    hasMore={!network1.hasNoMore}
                    scrollUpOnBack={scrollUpOnBack}
                    ListEmptyComponent={<View><Text style={STYLES.empty_message}>{i18n.t('community.empty_screen')}</Text><AppShareButton text={i18n.t('actions.invite')}/></View>}
                    // initialNumToRender={5}
                    decorateLoadMoreCall={(sections: any[], call: Call) => call.addQuery({id_lt: _.last(sections).id})}
                    visibility={super.getVisibility()}
                    SectionSeparatorComponent={({leadingItem, trailingItem, leadingSection, section, trailingSection}) => {
                        // return <View style={{height: 10, backgroundColor: 'blue'}}/>
                        if (!leadingItem && trailingItem === _.get(section, 'data[0]')) {
                            return TRANSPARENT_SPACER(20)()
                        }
                        return null
                    }}
                    style={{backgroundColor: Colors.greying}}

                    ItemSeparatorComponent={({leadingItem, trailingItem, section}) => {
                        if (leadingItem === section.data[0]) {
                            return (
                                <Text style={{
                                    fontSize: 17,
                                    margin: LINEUP_PADDING,
                                    fontFamily: SFP_TEXT_MEDIUM
                                }}>{i18n.t('detail_screen.related_activities_title')}</Text>
                            )
                        }
                        return null

                    }}
                    {...attr}
                    contentOffset={{x: 0, y: 100}}
                />

            </View>
        );
    }

    renderAskInput() {
        return <GTouchable onPress={() => this.showAsk()}><AskInput editable={false} pointerEvents='none'/></GTouchable>
    }

    showAsk() {
        let {navigator} = this.props;
        //1: https://github.com/wix/react-native-navigation/issues/1502
        navigator.showModal({
            screen: 'goodsh.AskScreen', // unique ID registered with Navigation.registerScreen
            animationType: 'none'
        });
    }

    renderSectionFooter(section: NetworkSection) {
        const count = section.activityCount - section.data.length
        if (!count) return null
        const loading = this.state['reqFetchMore' + section.id] === 'sending'
        return (
            <View style={{flexDirection: 'row', alignItems: 'center',
                backgroundColor: Colors.white,
                paddingHorizontal: LINEUP_PADDING,
                paddingVertical: 4,
            }}>
                {!loading && <Text>{i18n.t('there_are_activities', {count})}</Text>}

                {renderSimpleButton(
                    ' ' + i18n.t('more_activities', {count}),
                    ()=> safeDispatchAction.call(
                        this,
                        this.props.dispatch,
                        fetchMyNetwork({limit: 1, activity_by_group: section.activityCount, id_lte: section.id}).createActionDispatchee(FETCH_ACTIVITIES, {userId: currentUserId()}),
                        'reqFetchMore' + section.id
                    ).then(() => scheduleOpacityAnimation()),
                    {loading: loading,
                        textStyle: {fontSize: 14,},
                        style: {margin: 0, height: 30}}
                )}
            </View>

        )
    }

    navToActivity(activity) {
        this.props.navigator.showModal({
            screen: 'goodsh.ActivityDetailScreen',
            passProps: {activityId: activity.id, activityType: activity.type},
        });
    }

    renderItem(activity: Activity, index: number) {
        if (index === 0) {
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
        else {
            return (
                <GTouchable onPress={() => {
                    seeActivityDetails(this.props.navigator, activity)
                }}>
                    <ActivityStatus
                        activity={activity}
                        descriptionNumberOfLines={3}
                        navigator={this.props.navigator}
                        cardStyle={{
                            paddingHorizontal: LINEUP_PADDING,
                            paddingVertical: 10,}}
                    />
                </GTouchable>
            )
        }
    }
}

let screen = NetworkScreen;

export {screen};
