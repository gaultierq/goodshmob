// @flow

import React from 'react';
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
} from 'react-native';

import {connect} from "react-redux";
import type {Id, RNNNavigator, Saving} from "../../types";
import {TAB_BAR_PROPS} from "../UIStyles";
import {currentGoodshboxId, currentUser, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {displayHomeSearch, startAddItem} from "../Nav";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import {PROFILE_CLICKED} from "../components/MyAvatar";
import OnBoardingManager from "../../managers/OnBoardingManager";
import {floatingButtonScrollListener, registerLayoutAnimation} from "../UIComponents";
import {Tip, TipConfig} from "../components/Tip";
import {HomeOnBoardingHelper} from "./HomeOnBoardingHelper";
import {TabBar, TabViewAnimated} from "react-native-tab-view";
import ActionButton from 'react-native-action-button';
import MyGoodsh from "./MyGoodsh";
import MyInterests from "./MyInterests";
import {fullName} from "../../helpers/StringUtils";


type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    focusedSaving?: Saving,
    isActionButtonVisible: boolean,
    filterFocused?: boolean,
    currentTip?: ?TipConfig,
    index: number,
};


@logged
@connect(state=>({
    config: state.config,
    onBoarding: state.onBoarding,
}))
export default class HomeScreen extends Screen<Props, State> {

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
        rightButtons: [
        ],
    };

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };


    state = {
        focusedSaving: false,
        isActionButtonVisible: true,
        index: 0,
        routes: [
            {key: `my_goodsh`, title: i18n.t("home.tabs.my_goodsh")},
            {key: `my_interests`, title: i18n.t("home.tabs.my_interests")},
        ],
        // currentTip: TEST_TIP
    }

    onBoardingHelper = new HomeOnBoardingHelper()


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

    feed: any

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        //console.debug("home:onNavigatorEvent" , event);

        if (event.id === 'bottomTabReselected' && this.feed) {
            this.feed.scrollToLocation({sectionIndex: 0, itemIndex: 0, viewOffset: 50})
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

        this.onBoardingHelper.listenTipChange(tip => {
            if (tip !== this.state.currentTip) {
                console.debug(`new tip`, tip)
                registerLayoutAnimation("opacity")
                this.setState({currentTip: tip})
            }
        })
    }


    render() {

        this.setNavigatorTitle(this.props.navigator, {
            title: fullName(currentUser(false)),
        })

        return (
            <View style={{flex:1}}>

                <TabViewAnimated
                    style={{flex: 1}}
                    navigationState={{...this.state, visible: this.isVisible()}}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={props => <TabBar {...TAB_BAR_PROPS} {...props}/>}
                    onIndexChange={index => this.setState({index})}
                />
                {this.displayFloatingButton() && this.renderFloatingButton()}
            </View>
        )
    }


    displayFloatingButton() {
        return !this.state.filterFocused && this.state.isActionButtonVisible && this.state.index === 0;
    }

    renderScene({ route, focused }: *) {
        switch (route.key) {
            case 'my_goodsh':
                return (
                    <MyGoodsh
                        visibility={focused ? 'visible' : 'hidden'}
                        navigator={this.props.navigator}
                        onScroll={floatingButtonScrollListener.call(this)}
                        // ItemSeparatorComponent={() => <View style={{height: StyleSheet.hairlineWidth, backgroundColor: Colors.white}} />}
                        ItemSeparatorComponent={() => null}
                        ListHeaderComponent={
                            !this.state.filterFocused && this.state.currentTip && this.renderTip()
                        }
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

        ;
        return <Tip
            {...res}
            materialIcon={currentTip.materialIcon}
            style={{margin: 10}}
            onClickClose={() => {
                OnBoardingManager.onDisplayed(currentTip.type)
            }}

        />;
    }

    _targetRef = (primaryText, secondaryText) => ref => {
        if (!ref) return;
        this.onBoardingHelper.registerTapTarget(ref, primaryText, secondaryText)
    };

    renderFloatingButton() {

        return (
            <ActionButton
                buttonColor={Colors.green}
                onPress={() => {startAddItem(this.props.navigator, currentGoodshboxId())}}
                mainRef={this._targetRef(i18n.t("home.wizard.action_button_label"), i18n.t("home.wizard.action_button_body"))}
                buttonTextStyle={{fontSize: 26, fontWeight: 'bold', marginTop: -5}}
            />
        );
    }
}
