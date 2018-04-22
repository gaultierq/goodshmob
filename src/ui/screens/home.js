// @flow

import React from 'react';
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Platform,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {connect} from "react-redux";
import ActionButton from 'react-native-action-button';
import {LineupListScreen} from './lineuplist'
import type {Id, Lineup, RNNNavigator, Saving, SearchToken} from "../../types";
import {List} from "../../types"
import Snackbar from "react-native-snackbar"
import {
    BACKGROUND_COLOR, FEED_INITIAL_LOADER_DURATION, NavStyles, renderSimpleButton, stylePadding,
    STYLES
} from "../UIStyles";
import {currentGoodshboxId, currentUserId, isCurrentUserId, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import Modal from 'react-native-modal'
import type {Visibility} from "./additem";
import {LINEUP_DELETION, patchLineup} from "../lineup/actions";
import * as Nav from "../Nav";
import {startAddItem} from "../Nav";
import SmartInput from "../components/SmartInput";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import {PROFILE_CLICKED} from "../components/MyAvatar";
import {SFP_TEXT_MEDIUM} from "../fonts";
import LineupTitle from "../components/LineupTitle";
import Feed from "../components/feed";
import LineupCellSaving from "../components/LineupCellSaving";

import GTouchable from "../GTouchable";
import AddLineupComponent from "../components/addlineup";
import type {OnBoardingStep} from "../../managers/OnBoardingManager";
import OnBoardingManager from "../../managers/OnBoardingManager";
import NoSpamDialog from "./NoSpamDialog";
// $FlowFixMe
import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget";
import LineupHorizontal, {LineupH1} from "../components/LineupHorizontal";
import {seeList} from "../Nav";
import {seeActivityDetails} from "../Nav";
import UserLineups from "./userLineups";
import {floatingButtonScrollListener} from "../UIComponents";
import BottomSheet from "react-native-bottomsheet";
import {displayShareLineup} from "../Nav";


type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    focusedSaving?: Saving,
    isActionButtonVisible: boolean
};

@logged
@connect(state=>({
    config: state.config,
    onBoarding: state.onBoarding,
}))
class HomeScreen extends Screen<Props, State> {

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
            // {
            //     icon: require('../../img2/searchHeaderIcon.png'),
            //     id: 'search'
            // }
        ],
    };

    state = {
        focusedSaving: false,
        isActionButtonVisible: true
    }

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    appTourTargets = new Map();


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
        //console.debug("home:onNavigatorEvent" + JSON.stringify(event));


        //HACK
        if (event.type === 'DeepLink') {
            switch (event.link) {
                case PROFILE_CLICKED:
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
                    this.launchSearch();
                    break;
            }
        }
    }


    launchSearch(token?: SearchToken) {
        let navigator = this.props.navigator;

        navigator.showModal({
            screen: 'goodsh.HomeSearchScreen', // unique ID registered with Navigation.registerScreen
            animationType: 'none',
            backButtonHidden: true,
            passProps: {
                onClickClose: () => navigator.dismissModal({animationType: 'none'}),
                token
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
            //
            // navigatorButtons: Nav.CANCELABLE_SEARCH_MODAL(),
        });
    }

    componentDidAppear() {

        //if a new onBoarding step is broadcasted, then display it
        OnBoardingManager.listenToStepChange({
            triggerOnListen: true,
            callback: (step?: ?OnBoardingStep) => {
                const visible = this.isVisible();
                console.debug(`OnBoardingManager:step=${step} visible=${visible}`);
                if (step === 'focus_add' && visible) {
                    setTimeout(() => {
                        this.displayFocusAdd();
                    }, 1000);
                }
            }
        })
    }

    displayFocusAdd() {
        if (!this.isVisible()) {
            console.warn('home is not visible anymore. aborting');
            return false;
        }

        if (this.appTourTargets.size > 0) {
            let appTourSequence = new AppTourSequence();
            this.appTourTargets.forEach((appTourTarget, view) => {
                appTourSequence.add(appTourTarget);
            });
            AppTour.ShowSequence(appTourSequence);


            //as we don't have a callback on when the tour is finished,
            // we are using a 10s timer, to go to the next onBoardingStep
            setTimeout(() => {
                OnBoardingManager.onDisplayed('focus_add')
            }, 10000);

        }
        else {
            console.warn('appTourTargets.size === 0. aborting');
        }
        return true;
    }

    // _onScroll = floatingButtonScrollListener.call(this);

    render() {

        const userId = currentUserId();
        const navigator = this.props.navigator;

        return (
            // FIXME: workflow w/ padding bottom to fix the last cutted item
            // in the lineups list, a better solution might come with #371
            // 70 is the size of a lineup cell
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

                    sectionMaker={(lineups)=> {
                        const goodshbox = _.head(lineups);
                        let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
                        return [
                            {
                                data: goodshbox ? [goodshbox] : [],
                                title: i18n.t("lineups.goodsh.title"),
                                subtitle: ` (${savingCount})`,
                                onPress: () => seeList(navigator, goodshbox),
                                renderItem: ({item, index}) => <LineupH1
                                    lineup={item}
                                    navigator={navigator}
                                    skipLineupTitle={true}
                                />
                            },
                            {
                                data: _.slice(lineups, 1),
                                title: i18n.t("lineups.mine.title"),
                                renderSectionHeaderChildren:() => <AddLineupComponent navigator={this.props.navigator}/>,
                                renderItem: ({item, index})=>(
                                    <LineupH1 lineup={item} navigator={navigator}
                                              withMenuButton={true}
                                              onPressEmptyLineup={() => startAddItem(navigator, item.id)}
                                              renderMenuButton={() => {
                                                  //TODO: dubious 15
                                                  return this.renderMenuButton(item, 15)
                                              }}
                                              renderTitle={(lineup: Lineup) => <LineupTitle lineup={lineup} style={{marginBottom: 10,}}/>}
                                              style={[
                                                  {paddingTop: 8, paddingBottom: 12},
                                                  {backgroundColor: index % 2 === 1 ? 'transparent' : 'rgba(255, 255, 255, 0.3)'}
                                                  ]}
                                    />
                                )
                            },
                        ];
                    }}

                />




                {this.state.isActionButtonVisible && this.renderFloatingButton()}
            </View>
        );
    }

    //TODO: use right manager
    renderMenuButton(item: Lineup, padding: number) {
        if (!item) return null;

        //TODO: use right manager
        if (item.id === currentGoodshboxId()) return null;

        // console.log("paddings:" + stylePadding(padding, 12));
        let handler = () => {
            BottomSheet.showBottomSheetWithOptions({
                options: [
                    i18n.t("actions.change_title"),
                    i18n.t("actions.share_list"),
                    i18n.t("actions.delete"),
                    i18n.t("actions.cancel")
                ],
                title: item.name,
                dark: true,
                destructiveButtonIndex: 2,
                cancelButtonIndex: 3,
            }, (value) => {
                switch (value) {
                    case 0:
                        this.changeTitle(item);
                        break;
                    case 1:
                        displayShareLineup(this.props.navigator, item)
                        break;
                    case 2:
                        this.deleteLineup(item);
                        break;

                }
            });
        };
        return (<View style={{position: "absolute", right: 0, margin: 0}}>
            <GTouchable onPress={handler}>
                <View style={{...stylePadding(padding, 14)}}>
                    <Image
                        source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
                </View>
            </GTouchable>
        </View>);
    }


    //TODO: move out of home
    deleteLineup(lineup: List) {
        let delayMs = 3000;
        //deleteLineup(lineup.id, delayMs)
        const lineupId = lineup.id;
        return Alert.alert(
            i18n.t("alert.delete.title"),
            i18n.t("alert.delete.label"),
            [
                {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: i18n.t("actions.ok"), onPress: () => {
                        this.props.dispatch(LINEUP_DELETION.pending({lineupId}, {delayMs, lineupId}))
                            .then(pendingId => {
                                Snackbar.show({
                                        title: i18n.t("activity_item.buttons.deleted_list"),
                                        duration: Snackbar.LENGTH_LONG,
                                        action: {
                                            title: i18n.t("actions.undo"),
                                            color: 'green',
                                            onPress: () => {
                                                this.props.dispatch(LINEUP_DELETION.undo(pendingId))
                                            },
                                        },
                                    }
                                );
                            });
                    }
                },
            ],
            { cancelable: true }
        );
    }

    //TODO: move out of home
    changeTitle(lineup: List) {
        let {id, name} = lineup;


        this.props.navigator.showModal({
            screen: 'goodsh.ChangeLineupName',
            animationType: 'none',
            passProps: {
                lineupId: id,
                initialLineupName: name
            }
        });
    }


    renderSaving(saving: Saving) {
        return (
            <GTouchable
                onPress={() => seeActivityDetails(this.props.navigator, saving)}
            >
                <LineupCellSaving item={saving.resource} />
            </GTouchable>
        );
    }

    // render() {return <View style={{width: 50, height: 50, backgroundColor: BACKGROUND_COLOR}}/>}

    _targetRef = (primaryText, secondaryText) => ref => {
        if (!ref) return;

        if (!this.appTourTargets.has(ref)) {
            let params;
            if (__IS_IOS__) {
                params = {
                    primaryText,
                    secondaryText,
                    targetHolderColor: Colors.blue,
                    targetTintColor: Colors.white,
                    primaryTextColor: Colors.white,
                }
            }
            else {
                params = {
                    title: primaryText,
                    description: secondaryText,
                    //defined in android/app/src/main/res/values/colors.xml
                    outerCircleColor: 'outerCircleColorPrimary',
                    targetCircleColor: 'outerCircleColorSecondary',
                }
            }

            let appTourTarget = AppTourView.for(ref, params);
            this.appTourTargets.set(ref, appTourTarget);
        }
    };

    renderFloatingButton() {

        return (
            <ActionButton
                buttonColor={Colors.green}
                onPress={() => {
                    this.onFloatingButtonPressed()
                }}
                mainRef={this._targetRef(i18n.t("home.wizard.action_button_label"), i18n.t("home.wizard.action_button_body"))}
                buttonTextStyle={{fontSize: 26, fontWeight: 'bold', marginTop: -5}}
            />
        );
    }


    onFloatingButtonPressed() {
        startAddItem(this.props.navigator, currentGoodshboxId());
    }
}



const screen = HomeScreen;


export {screen};
