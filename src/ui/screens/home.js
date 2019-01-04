// @flow

import React from 'react'
import {
    Alert,
    BackHandler,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import {connect} from "react-redux"
import type {RNNNavigator, Saving} from "../../types"
import {currentGoodshboxId, currentUser, currentUserId, isLogged, logged} from "../../managers/CurrentUser"
import {CheckBox} from 'react-native-elements'
import {Navigation, ScreenVisibilityListener as RNNScreenVisibilityListener} from 'react-native-navigation'
import * as Nav from "../Nav"
import {CLOSE_MODAL, displayHomeSearch, startAddItem} from "../Nav"
import Screen from "../components/Screen"
import {PROFILE_CLICKED} from "../components/MyAvatar"
import OnBoardingManager from "../../managers/OnBoardingManager"
import {
    floatingButtonScrollListener,
    getAddButton,
    renderSectionHeader2,
    scheduleOpacityAnimation
} from "../UIComponents"
import type {TipConfig} from "../components/Tip"
import {Tip} from "../components/Tip"
import {HomeOnBoardingHelper} from "./HomeOnBoardingHelper"
import MyGoodsh from "./MyGoodsh"
import MyInterests from "./MyInterests"
import NotificationManager from '../../managers/NotificationManager'
import {createCounter} from "../../helpers/DebugUtils"
import FriendsList from "./friends"
import {GAvatar} from "../GAvatar"
import {BACKGROUND_COLOR} from "../UIStyles"
import GTouchable from "../GTouchable"
import {Colors} from "../colors"
import Ionicons from 'react-native-vector-icons/Ionicons'

type Props = {
    navigator: RNNNavigator
};

type State = {
    focusedSaving?: Saving,
    isActionButtonVisible: boolean,
    filterFocused?: boolean,
    currentTip?: TipConfig,
    popularDisplayCount?: number,
    index: number,
}


const ROUTES = [
    {key: `my_goodsh`, title: i18n.t("home.tabs.my_goodsh")},
    {key: `my_interests`, title: i18n.t("home.tabs.my_interests")},
]

export function renderTip(currentTip: TipConfig) {

    let {keys, ...attr} = currentTip
    let res = {};
    ['title', 'text', 'button'].forEach(k => {
        res[k] = i18n.t(`${keys}.${k}`)
    })
    return <Tip
        {...res}
        {...attr}
        style={{margin: 10}}
        onClickClose={() => {
            OnBoardingManager.postOnDismissed(currentTip.type)
        }}

    />
}

const logger = rootlogger.createLogger('home')
const counter = createCounter(logger)

@logged
@connect((state, props)=>({
    config: state.config,
    onBoarding: state.onBoarding,
    currentUser: _.get(state, `data.users.${props.userId}`)
}))
export default class HomeScreen extends Screen<Props, State> {


    static navigatorButtons = getAddButton()

    _mounted: boolean
    feed: any
    onBoardingHelper = new HomeOnBoardingHelper()
    state = {
        focusedSaving: false,
        isActionButtonVisible: true,
        index: 0,
        popularDisplayCount: 0,
        routes: ROUTES,
        // currentTip: TEST_TIP
    }

    constructor(props: Props){
        super(props);
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together


        if (__IS_IOS__ && event.id === 'bottomTabReselected' && this.feed) {
            //__IS_IOS__ because of: scrollToIndex should be used in conjunction with getItemLayout or onScrollToIndexFailed
            this.setState({index: 0})
            this.feed.scrollToLocation({sectionIndex: 0, itemIndex: 0, viewOffset: 50})
        }
        if (event.id === 'add') {
            startAddItem(this.props.navigator, currentGoodshboxId())

            return
        }
        //HACK
        if (event.type === 'DeepLink') {
            switch (event.link) {
                case PROFILE_CLICKED:
                    this.showProfile()
                    break;
                // case "topLevelIndex":
                //     this.props.navigator.switchToTab({
                //         tabIndex: event.payload
                //     });
                //     break
            }
        }


        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            switch (event.id) {
                case 'profile':
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
                case 'search':
                    displayHomeSearch(this.props.navigator, "")
                    break;
            }
        }
    }

    showProfile() {
        Keyboard.dismiss()
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true
        })
    }

    componentDidMount() {
        logger.debug("componentDidMount")
        this._mounted = true
    }

    componentWillUnmount() {
        logger.debug("componentWillUnmount")
        this._mounted = false
        this.onBoardingHelper.clearTapTarget()
    }


    render() {
        logger.debug("rendering home", this.state)

        counter('render')

        return (

            <SafeAreaView style={{flex:1}}>
                {this.renderMyGoodshs(true)}
            </SafeAreaView>
        )
    }

    componentDidAppear() {
        this.refreshOnBoarding()
    }

    startTunnel() {
        this.props.navigator.showModal({
            screen: 'goodsh.PopularItemsScreen',
            backButtonHidden: true,
            passProps: {
                onFinished: (navigator) => {

                    //this is a hack because of RNN v1 limitations
                    let listener = new RNNScreenVisibilityListener({
                        didAppear: ({screen, startTime, endTime, commandType}) => {
                            if (screen === 'goodsh.InviteManyContacts') {
                                logger.debug("hack visib listener: appear", screen)
                            }
                        },
                        didDisappear: ({screen, startTime, endTime, commandType}) => {
                            logger.debug("hack visib listener: disappear", screen)
                            if (screen === 'goodsh.InviteManyContacts') {
                                listener.unregister()
                                OnBoardingManager.postOnDismissed("popular")
                            }
                        }
                    })
                    listener.register()


                    navigator.push({
                        screen: 'goodsh.InviteManyContacts',
                        title: i18n.t('actions.invite'),
                        backButtonHidden: true,
                        navigatorButtons: {
                            leftButtons: [],
                            rightButtons: [
                                {
                                    id: CLOSE_MODAL,
                                    title: i18n.t('skip'),
                                }
                            ]
                        }
                    })
                }
            },

        })
    }

    refreshOnBoarding() {

        //TODO: rm this settimeout
        setTimeout(() => {

            let info = OnBoardingManager.getInfoToDisplay(this.props.onBoarding, {group: "full_focus", persistBeforeDisplay: true});
            if (!info) return

            let {type} = info
            logger.debug("found info to display:", type)
            switch (type) {
                case "focus_add":
                    if (this._mounted && isLogged()) {
                        this.onBoardingHelper.handleFocusAdd(() => this._mounted && isLogged())
                    }
                    break
                case "notification_permissions":
                    NotificationManager.requestPermissionsForLoggedUser()
                    break
                case "popular":
                    if (this.state.popularDisplayCount === 0) {
                        this.setState({popularDisplayCount: 1}, () => {
                            this.startTunnel()
                        })
                    }
                    break
            }
        })

    }

    //!\\ hypothesis: logout => store.currentUser becomes null => update is triggered
    //    => focusAdd is posted natively => component is unmounted
    //    => the native code doesnt find the unmounted component
    componentDidUpdate() {
        this.refreshOnBoarding()
    }

    renderMyInterests(focused) {
        return <MyInterests
            navigator={this.props.navigator}
            visibility={focused ? 'visible' : 'hidden'}
            ListHeaderComponent={(icr) => icr && renderSectionHeader2(i18n.t("home.tabs.my_interests"))}
        />
    }

    renderMyGoodshs(focused) {
        return <MyGoodsh
            visibility={focused ? 'visible' : 'hidden'}
            navigator={this.props.navigator}
            listRef={ref => this.feed = ref}
            onScroll={floatingButtonScrollListener.call(this)}
            ListHeaderComponent={this._ListHeaderComponent}
            ListFooterComponent={this.renderMyInterests()}
            targetRef={this._targetRef("add", i18n.t("home.wizard.action_button_label"), i18n.t("home.wizard.action_button_body"))}
            onFilterFocusChange={filterFocused => new Promise(resolved => {
                this.setState({filterFocused}, resolved())
            })
            }
        />
    }

    _ListHeaderComponent = () => {
        if (this.state.filterFocused) return null
        if (this.state.currentTip) return renderTip(this.state.currentTip)
        return (this.renderHorizontalFriends())
    }

    renderHorizontalFriends() {
        return <FriendsList
            userId={currentUserId()}
            displayName={"home_friend_list"}
            renderItem={({item, index}) => <View style={{margin: 1}}><GAvatar person={item} size={50} seeable/></View>}
            ItemSeparatorComponent={() => <View style={{margin: 4}}/>}
            hasMore={false}
            style={{paddingHorizontal: 8, paddingVertical: 8, backgroundColor: BACKGROUND_COLOR}}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={(
                <GTouchable style={{
                    // width: 54,
                    // height: 54,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    padding: 1,
                    borderColor: Colors.orange,
                    borderRadius: 28,
                    marginRight: 8,
                    alignItems: 'center',
                }} onPress={() => {
                    this.showProfile()
                }}>
                    <GAvatar person={currentUser()} size={50}/>
                </GTouchable>
            )}
            ListFooterComponent={(
                <GTouchable style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                    alignItems: 'center',
                }} onPress={() => {
                    this.showFriends()
                }}>
                    <Ionicons name="ios-person-add" size={50} color={Colors.orange}/>
                </GTouchable>
            )}
        />
    }

    showFriends() {
        this.props.navigator.showModal({
            screen: 'goodsh.Community',
            title: i18n.t("community.screens.friends"),
            navigatorButtons: {
                ...Nav.CANCELABLE_MODAL,
            }
        })
    }


    isFocused(route) {
        return this.state.index === ROUTES.indexOf(route)
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        let current = state.currentTip

        let nextTip = OnBoardingManager.getInfoToDisplay(props.onBoarding, {group: 'tip', persistBeforeDisplay: true})
        if (_.get(current, 'type') === _.get(nextTip, 'extraData.type')) {
            return null
        }
        else {
            scheduleOpacityAnimation()
            return {...state, currentTip: _.get(nextTip, 'extraData')}
        }

    }

    _targetRef = (refName, primaryText, secondaryText) => ref => {
        if (!ref) return;
        this.onBoardingHelper.registerTapTarget(refName, ref, primaryText, secondaryText)
    };

}
