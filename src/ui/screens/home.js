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
import ActionButton from 'react-native-action-button';
import type {Id, Lineup, RNNNavigator, Saving} from "../../types";
import {stylePadding, STYLES} from "../UIStyles";
import {currentGoodshboxId, currentUserId, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {displayHomeSearch, displayLineupActionMenu, seeList, startAddItem} from "../Nav";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import {PROFILE_CLICKED} from "../components/MyAvatar";
import LineupTitle from "../components/LineupTitle";

import GTouchable from "../GTouchable";
import AddLineupComponent from "../components/addlineup";
import OnBoardingManager from "../../managers/OnBoardingManager";
import LineupHorizontal, {LineupH1} from "../components/LineupHorizontal";
import UserLineups from "./userLineups";
import {floatingButtonScrollListener, registerLayoutAnimation} from "../UIComponents";
import {Tip, TipConfig} from "../components/Tip";
import {HomeOnBoardingHelper} from "./HomeOnBoardingHelper";


type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    focusedSaving?: Saving,
    isActionButtonVisible: boolean,
    filterFocused?: boolean,
    currentTip?: ?TipConfig
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

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        //console.debug("home:onNavigatorEvent" , event);


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
        const userId = currentUserId();
        const navigator = this.props.navigator;

        if (this.isVisible()) {
            this.onBoardingHelper.handleFocusAdd()
        }

        return (
            <View style={{flex:1}}>

                <UserLineups
                    displayName={"home feed"}
                    feedId={"home list"}
                    userId={userId}
                    navigator={navigator}
                    empty={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    initialLoaderDelay={0}
                    onScroll={floatingButtonScrollListener.call(this)}
                    // ItemSeparatorComponent={() => <View style={{height: StyleSheet.hairlineWidth, backgroundColor: Colors.white}} />}
                    ItemSeparatorComponent={() => null}
                    ListHeaderComponent={
                        !this.state.filterFocused && this.state.currentTip && this.renderTip()
                    }
                    onFilterFocusChange={focused => new Promise(resolved => {
                        this.setState({filterFocused: focused}, resolved())
                    })
                    }

                    sectionMaker={(lineups)=> {
                        const goodshbox = _.head(lineups);
                        let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
                        return [
                            {
                                data: goodshbox ? [goodshbox] : [],
                                title: i18n.t("lineups.goodsh.title"),
                                subtitle: ` (${savingCount})`,
                                onPress: () => seeList(navigator, goodshbox),
                                renderItem: ({item, index}) => (
                                    <LineupH1
                                        lineup={item}
                                        navigator={navigator}
                                        skipLineupTitle={true}
                                        renderEmpty={this.renderEmptyLineup(navigator, item)}
                                    />
                                )
                            },
                            {
                                data: _.slice(lineups, 1),
                                title: i18n.t("lineups.mine.title"),
                                renderSectionHeaderChildren:() => <AddLineupComponent navigator={this.props.navigator}/>,
                                renderItem: ({item, index})=> this.renderLineup(item, index, navigator)
                            },
                        ];
                    }}

                />

                {!this.state.filterFocused && this.state.isActionButtonVisible && this.renderFloatingButton()}
            </View>
        );
    }

    renderLineup(item: Lineup, index: number, navigator: RNNNavigator) {
        return (
            <LineupH1
                lineup={item} navigator={navigator}
                withMenuButton={true}
                onPressEmptyLineup={() => startAddItem(navigator, item.id)}
                renderEmpty={this.renderEmptyLineup(navigator, item)}
                // TODO: watch https://github.com/facebook/react-native/issues/13202
                // ListHeaderComponent={
                //     () => <GTouchable
                //         onPress={() => startAddItem(navigator, item.id)}
                //         deactivated={item.pending}
                //     >
                //         {
                //             LineupHorizontal.renderEmptyCell(0, true)
                //         }
                //     </GTouchable>
                //
                // }
                // initialScrollIndex={1}
                // initialNumToRender={6}
                // getItemLayout={(data, index) => (
                //     {length: ITEM_DIM, offset: (ITEM_DIM + ITEM_SEP)* index, index}
                // )}
                // onScrollToIndexFailed={err=>{console.warn('onScrollToIndexFailed',err)}}
                // contentOffset={{y: ITEM_DIM + ITEM_SEP, x: ITEM_DIM + ITEM_SEP}}
                // contentOffset={{x: 30, y: 10, }}
                renderMenuButton={() => {
                    //TODO: dubious 15
                    return this.renderMenuButton(item, 15)
                }}
                renderTitle={(lineup: Lineup) => <LineupTitle lineup={lineup} style={{marginBottom: 10,}}/>}
                style={[
                    {paddingTop: 8, paddingBottom: 12},
                    {backgroundColor: index % 2 === 1 ? 'transparent' : 'rgba(255, 255, 255, 0.3)'}
                ]}
            />)
    }

    renderEmptyLineup(navigator: RNNNavigator, item: Lineup) {
        return (list: Lineup) => (
            <GTouchable
                onPress={() => startAddItem(navigator, item.id)}
                deactivated={item.pending}
            >
                {
                    LineupHorizontal.defaultRenderEmpty(true)
                }
            </GTouchable>
        );
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

    renderMenuButton(item: Lineup, padding: number) {
        //TODO: use right manager
        if (!item || item.id === currentGoodshboxId()) return null;

        return (
            <GTouchable style={{position: "absolute", right: 0, margin: 0}} onPress={() => displayLineupActionMenu(this.props.navigator, this.props.dispatch, item)}>
                <View style={{...stylePadding(padding, 14)}}>
                    <Image
                        source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
                </View>
            </GTouchable>
        );
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
