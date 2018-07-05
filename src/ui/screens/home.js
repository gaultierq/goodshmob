// @flow

import React from 'react'
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import {connect} from "react-redux"
import type {Id, RNNNavigator, Saving} from "../../types"
import {TAB_BAR_PROPS} from "../UIStyles"
import {currentGoodshboxId, currentUser, logged} from "../../managers/CurrentUser"
import {CheckBox} from 'react-native-elements'
import {Navigation} from 'react-native-navigation'
import {displayHomeSearch, startAddItem} from "../Nav"
import Screen from "../components/Screen"
import {PROFILE_CLICKED} from "../components/MyAvatar"
import OnBoardingManager from "../../managers/OnBoardingManager"
import {floatingButtonScrollListener, getAddButton, getClearButton, scheduleOpacityAnimation} from "../UIComponents"
import {Tip, TipConfig} from "../components/Tip"
import {HomeOnBoardingHelper} from "./HomeOnBoardingHelper"
import {PagerPan, TabBar, TabView} from "react-native-tab-view"
import MyGoodsh from "./MyGoodsh"
import MyInterests from "./MyInterests"
import {fullName2} from "../../helpers/StringUtils"
import {currentUserFilter} from "../../redux/selectors"
import NotificationManager from '../../managers/NotificationManager'
import {Colors} from "../colors"

type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    focusedSaving?: Saving,
    isActionButtonVisible: boolean,
    filterFocused?: boolean,
    currentTip?:TipConfig,
    popularDisplayCount?: number,
    index: number,
}


const ROUTES = [
    {key: `my_goodsh`, title: i18n.t("home.tabs.my_goodsh")},
    {key: `my_interests`, title: i18n.t("home.tabs.my_interests")},
]
@logged
@connect((state, props)=>({
    config: state.config,
    onBoarding: state.onBoarding,
    currentUser: currentUserFilter(state, props)
}))
export default class HomeScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false,
        navBarButtonColor: Colors.green
    };


    static navigatorButtons = {

        //'component' doesnt work on android :/
        leftButtons: [
            __IS_IOS__ ?
                {
                    id: 'profile',
                    component: 'goodsh.MyAvatar'
                }:
                {
                    icon: require('../../img/goodshersHeaderProfileIcon.png'),
                    id: 'profile',
                }
        ],
    }

    logger = rootlogger.createLogger("home")
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

    componentWillAppear() {
        this.props.navigator.setDrawerEnabled({side: 'left', enabled: true});
        this.props.navigator.setDrawerEnabled({side: 'right', enabled: false});
    }


    componentWillDisappear() {
        this.props.navigator.setDrawerEnabled({side: 'left', enabled: false});
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        //console.debug("home:onNavigatorEvent" , event);

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
                    Keyboard.dismiss();
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
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

    componentDidAppear() {

        // this.onBoardingHelper.listenTipChange(tip => {
        //     if (tip !== this.state.currentTip) {
        //         console.debug(`new tip`, tip)
        //         registerLayoutAnimation("opacity")
        //         this.setState({currentTip: tip})
        //     }
        // })
        this.refreshOnBoarding()
        this.refreshRightButtons()
    }

    refreshOnBoarding() {

        //TODO: rm this settimeout
        setTimeout(() => {

            let info = OnBoardingManager.getInfoToDisplay(this.props.onBoarding, {group: "full_focus", persistBeforeDisplay: true});
            if (!info) return

            let {type} = info
            this.logger.debug("found info to display:", type)
            switch (type) {
                case "focus_add":
                    this.onBoardingHelper.handleFocusAdd()
                    break
                case "notification_permissions":
                    NotificationManager.requestPermissionsForLoggedUser()
                    break
                case "popular":
                    if (this.state.popularDisplayCount === 0) {
                        this.setState({popularDisplayCount: 1}, () => {
                            this.props.navigator.showModal({
                                screen: 'goodsh.PopularItemsScreen',
                                backButtonHidden: true,
                                passProps: {
                                    onFinished: () => {
                                        OnBoardingManager.postOnDismissed("popular")
                                        this.props.navigator.dismissModal()
                                    }
                                },
                            })
                        })
                    }
                    break
            }
        })

    }

    componentDidUpdate() {
        this.refreshOnBoarding()
    }


    render() {

        this.logger.debug("rendering home", this.state)

        this.setNavigatorTitle(this.props.navigator, {title: fullName2(_.get(this.props, 'currentUser.attributes'))})

        return (
            <View style={{flex:1}}>

                <TabView
                    style={{flex: 1}}
                    navigationState={{...this.state, visible: this.isVisible()}}
                    renderScene={this.renderScene.bind(this)}
                    renderTabBar={props => <TabBar {...TAB_BAR_PROPS} {...props}/>}
                    renderPager={props => <PagerPan {...props} />}
                    swipeEnabled={false}
                    onIndexChange={index => {
                        this.setState({index}, () => this.refreshRightButtons())
                    }}
                />
            </View>
        )
    }


    refreshRightButtons() {
        this.props.navigator.setButtons(this.state.index === 0 ? getAddButton() : getClearButton())
    }

    displayFloatingButton() {
        return __IS_ANDROID__  && !this.state.filterFocused && this.state.isActionButtonVisible && this.state.index === 0;
    }

    renderScene({ route}: *) {
        let ix = ROUTES.indexOf(route)
        let focused = this.state.index === ix
        switch (route.key) {

            case 'my_goodsh':
                return (
                    <MyGoodsh
                        visibility={focused ? 'visible' : 'hidden'}
                        navigator={this.props.navigator}
                        listRef={ref => this.feed = ref}
                        onScroll={floatingButtonScrollListener.call(this)}
                        // ItemSeparatorComponent={() => <View style={{height: StyleSheet.hairlineWidth, backgroundColor: Colors.white}} />}
                        ItemSeparatorComponent={() => null}
                        ListHeaderComponent={
                            !this.state.filterFocused && this.state.currentTip && this.renderTip()
                        }
                        targetRef={this._targetRef(i18n.t("home.wizard.action_button_label"), i18n.t("home.wizard.action_button_body"))}
                        onFilterFocusChange={filterFocused => new Promise(resolved => {
                            this.setState({filterFocused}, resolved())
                        })
                        }
                    />
                )
            case 'my_interests':
                return (
                    <MyInterests
                        navigator={this.props.navigator}
                        visibility={focused ? 'visible' : 'hidden'}
                    />
                )
            default: throw "unexpected"
        }
    }


    renderTip() {
        const currentTip = this.state.currentTip;
        let keys = currentTip.keys;
        let res = {};
        ['title', 'text', 'button'].forEach(k=> {
            res[k] = i18n.t(`${keys}.${k}`)
        })
        return <Tip
            {...res}
            materialIcon={currentTip.materialIcon}
            style={{margin: 10}}
            onClickClose={() => {
                OnBoardingManager.postOnDismissed(currentTip.type)
            }}

        />;
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

    _targetRef = (primaryText, secondaryText) => ref => {
        if (!ref) return;
        this.onBoardingHelper.registerTapTarget(ref, primaryText, secondaryText)
    };

}
