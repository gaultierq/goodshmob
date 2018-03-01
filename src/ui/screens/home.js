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
    View
} from 'react-native';

import {connect} from "react-redux";
import ActionButton from 'react-native-action-button';
import {LineupListScreen} from './lineuplist'
import type {Id, RNNNavigator, Saving, SearchToken} from "../../types";
import {List} from "../../types"
import Snackbar from "react-native-snackbar"
import {FEED_INITIAL_LOADER_DURATION, NavStyles, renderSimpleButton, stylePadding, STYLES} from "../UIStyles";
import {currentGoodshboxId, currentUserId, logged} from "../../managers/CurrentUser"
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
import BottomSheet from 'react-native-bottomsheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import type {OnBoardingStep} from "../../managers/OnBoardingManager";
import OnBoardingManager from "../../managers/OnBoardingManager";
import NoSpamDialog from "./NoSpamDialog";
// $FlowFixMe
import {AppTour, AppTourSequence, AppTourView} from "../../../vendors/taptarget";



type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    newLineupTitle?: string,
    newLineupPrivacy?: Visibility,
    filter?: ?string
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

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    state : State = {};


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

    componentDidMount() {

        //if a new onBoarding step is broadcasted, then display it
        OnBoardingManager.listenToStepChange({
            triggerOnListen: true,
            callback: (step?: ?OnBoardingStep) => {
                if (step === 'focus_add' && this.isVisible()) {
                    setTimeout(() => {
                        if (this.appTourTargets.size > 0) {
                            let appTourSequence = new AppTourSequence();
                            this.appTourTargets.forEach((appTourTarget, view) => {
                                appTourSequence.add(appTourTarget);
                            });
                            AppTour.ShowSequence(appTourSequence);


                            //as we don't have a callback on when the tour is finished,
                            // we are using a 10s timer, to go to the next onBoardingStep
                            setTimeout(()=>{
                                OnBoardingManager.onDisplayed('focus_add')
                            }, 10000);

                        }
                    }, 1000);
                }
            }
        })
    }

    render() {

        let onBoardingStep = OnBoardingManager.getPendingStep();

        if (onBoardingStep === 'no_spam') return <NoSpamDialog/>

        return (
            <View style={{flex:1}}>

                <LineupListScreen
                    displayName={"home feed"}
                    userId={currentUserId()}
                    onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                    onSavingPressed={(saving) => this.onSavingPressed(saving)}
                    navigator={this.props.navigator}
                    //renderItem={(item)=>this.renderListItem(item, n, padding)}
                    scrollUpOnBack={super.isVisible() ? ()=>false : null}
                    cannotFetch={!super.isVisible()}
                    visibility={super.getVisibility()}
                    empty={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    initialLoaderDelay={FEED_INITIAL_LOADER_DURATION}
                    sectionMaker={(lineups)=> {
                        const goodshbox = _.head(lineups);
                        let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
                        return [
                            {
                                data: goodshbox ? [goodshbox] : [],
                                title: i18n.t("lineups.goodsh.title"),
                                subtitle: ` (${savingCount})`,
                                onPress: () => this.seeLineup(goodshbox.id),
                                renderItem: ({item})=>this.renderListItem(item)
                            },
                            {
                                data: _.slice(lineups, 1),
                                title: i18n.t("lineups.mine.title"),
                                renderSectionHeaderChildren:() => <AddLineupComponent navigator={this.props.navigator}/>,
                                renderItem: ({item})=>this.renderListItem(item, {withMenuButton: true, withLineupTitle: true})
                            },
                        ];
                    }}
                    renderSectionHeader={({section}) => this.renderSectionHeader(section)}
                    renderSectionFooter={()=> <View style={{height: 25, width: "100%"}} />}
                    ItemSeparatorComponent={()=> <View style={{margin: 6}} />}
                    feedId={"home list"}
                    filter={{
                        placeholder: 'search.in_feed',
                        onSearch: (searchToken: string) => {
                            this.launchSearch(searchToken);
                        },
                        emptyFilterResult: (searchToken: string) => (
                            <View>
                                <Text style={STYLES.empty_message}>{i18n.t('lineups.filter.empty')}</Text>
                                {renderSimpleButton(i18n.t('lineups.filter.deepsearch'), () => this.launchSearch(searchToken))}
                            </View>
                        ),
                        style: {
                            backgroundColor: NavStyles.navBarBackgroundColor,
                            paddingTop: 5,
                            paddingBottom: 5,
                            paddingLeft: 9,
                            paddingRight: 9,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.grey3
                        },
                        applyFilter: (sections, filter) => {
                            let contains = (container, token) => {
                                if (!container || !token) return false;
                                return container.toLowerCase().indexOf(token.toLowerCase()) >= 0;
                            };

                            let filterSavings = savings => {
                                return _.filter(savings, saving => saving && saving.resource && contains(saving.resource.title, filter))
                            };

                            let filterLineup = lineups => {
                                let result = [];
                                _.forEach(lineups, lineup => {
                                    if (contains(lineup.name, filter)) {
                                        result.push(lineup);
                                    }
                                    else {
                                        let savings = filterSavings(lineup.savings);
                                        if (!_.isEmpty(savings)) {
                                            result.push({...lineup, savings});
                                        }
                                    }
                                });
                                return result;
                            };


                            let result = [];
                            sections.forEach(section => {

                                const filteredLineups = filterLineup(section.data);

                                if (!_.isEmpty(filteredLineups)) {
                                    result.push({...section, data: filteredLineups});
                                }

                            });
                            return result;
                        }
                    }}
                />


                {this.displayFloatingButton() && this.renderFloatingButton()}
            </View>
        );
    }

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

    renderSectionHeader({title, subtitle, onPress, renderSectionHeaderChildren}) {
        return (<GTouchable
            disabled={!onPress}
            onPress={onPress}>
            <View style={{
                backgroundColor: Colors.white,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 15,
                paddingBottom: 10,
            }}>
                <Text style={{
                    fontSize: 20,
                    fontFamily: SFP_TEXT_MEDIUM
                }}>
                    {title}
                    {subtitle && <Text style={{fontSize: 16, color: Colors.greyish}}>{subtitle}</Text>}
                </Text>
                {renderSectionHeaderChildren && renderSectionHeaderChildren()}
            </View>
        </GTouchable>);
    }

    seeLineup(id: Id) {
        this.props.navigator.showModal({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: id,
            },
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    renderListItem(item: List, options = {}) {
        const {withMenuButton, withLineupTitle} = options;
        return (
            <View>
                {withLineupTitle && <GTouchable
                    onPress={() => this.seeLineup(item.id)}>

                    <View style={{flexDirection:'row', paddingLeft: 15, paddingRight: 15}}>
                        <LineupTitle lineup={item}/>
                        {withMenuButton && this.renderMenuButton(item, 15)}
                    </View>
                </GTouchable>}
                {this.renderList(item)}
            </View>

        )
    }

    renderEmptyList(list: List) {
        let result = [];
        // first item render
        result.push(<View key={`key-${0}`} style={[
            LineupCellSaving.styles.cell,
            {
                backgroundColor: Colors.grey3,
                marginRight: 10,
                opacity: 1,
                alignItems: 'center',
                justifyContent:'center'
            }
        ]}>
            <Icon name="plus" size={45} color={Colors.dirtyWhite}/>
        </View>);
        //
        for (let i = 1; i < 5; i++) {
            result.push(<View key={`key-${i}`} style={[
                LineupCellSaving.styles.cell,
                {
                    backgroundColor: Colors.grey3,
                    marginRight: 10,
                    opacity: 1 - (0.2 * i)
                }
            ]}/>);
        }
        return (<GTouchable onPress={() => {
            startAddItem(this.props.navigator, list.id);
        }
        }>
            <View style={{flexDirection: 'row', paddingLeft: 15}}>{result}</View>
        </GTouchable>);
    }

    renderList(list: List) {
        let savings = list.savings;
        if (_.isEmpty(savings)) {
            return this.renderEmptyList(list)
        }

        return <Feed
            data={savings}
            renderItem={({item}) => (
                <GTouchable onPress={()=>{this.onSavingPressed(item)}}>
                    <LineupCellSaving saving={item} style={{marginRight: 10}}/>
                </GTouchable>)
            }
            // fetchSrc={{
            //     callFactory: this.fetchInteractions.bind(this),
            //     useLinks: true,
            //     action: FETCH_INTERACTIONS,
            // }}
            hasMore={false}
            horizontal={true}
            // ItemSeparatorComponent={()=> <View style={{margin: 20}} />}
            contentContainerStyle={{paddingLeft: 15}}
            showsHorizontalScrollIndicator={false}
            // cannotFetch={!super.isVisible()}
        />
    }

    renderMenuButton(item, padding) {
        if (item.id === currentGoodshboxId()) return null;

        // console.log("paddings:" + stylePadding(padding, 12));
        let handler = () => {
            BottomSheet.showBottomSheetWithOptions({
                options: [i18n.t("actions.change_title"), i18n.t("actions.delete"), i18n.t("actions.cancel")],
                title: item.name,
                dark: true,
                destructiveButtonIndex: 1,
                cancelButtonIndex: 2,
            }, (value) => {
                switch (value) {
                    case 1:
                        this.deleteLineup(item);
                        break;
                    case 0:
                        this.changeTitle(item)
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

    displayFloatingButton() {
        return true;
    }

    onLineupPressed(lineup: List) {
        console.info("on linup pressed: " + JSON.stringify(lineup));
        this.props.navigator.showModal({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
            navigatorButtons: Nav.CANCELABLE_MODAL
        });
    }

    onSavingPressed(saving: Saving) {
        this.props.navigator.showModal({
            screen: 'goodsh.ActivityDetailScreen',
            passProps: {activityId: saving.id, activityType: saving.type},
            // navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    onFloatingButtonPressed() {
        startAddItem(this.props.navigator, currentGoodshboxId());
    }
}

const screen = HomeScreen;


export {screen};
