// @flow

import React from 'react';
import {
    BackHandler,
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import {connect} from "react-redux";
import ActionButton from 'react-native-action-button';
import {LineupListScreen} from './lineuplist'
import type {Id, RNNNavigator, Saving} from "../../types";
import {List} from "../../types"
import Snackbar from "react-native-snackbar"
import {stylePadding} from "../UIStyles";
import {currentGoodshboxId, currentUserId, logged2} from "../../managers/CurrentUser"
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


// let AppTour;
// let AppTourSequence;
// let AppTourView;
//
// if (__IS_IOS__) {
//     let showCase = require("react-native-material-showcase-ios");
//
//     AppTour = showCase.AppTour;
//     AppTourSequence = showCase.AppTourSequence;
//     AppTourView = showCase.AppTourView;
// }


type Props = {
    userId: Id,
    navigator: RNNNavigator
};

type State = {
    newLineupTitle?: string,
    newLineupPrivacy?: Visibility,
    changeLinupTitleId?: {id:Id, name: string}
};



// @logged
@connect()
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
                    icon: require('../../img/profil.png'),
                    id: 'profile',
                }
        ],
        rightButtons: [
            {
                icon: require('../../img2/searchHeaderIcon.png'),
                id: 'search'
            }
        ],
    };

    state : State = {};

    appTourTargets= [];


    constructor(props: Props){
        super(props);
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentWillAppear() {
        this.props.navigator.setDrawerEnabled({side: 'left', enabled: true});
        this.props.navigator.setDrawerEnabled({side: 'right', enabled: false});
        this._appear = true;
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
                    let navigator = this.props.navigator;

                    navigator.showModal({
                        screen: 'goodsh.HomeSearchScreen', // unique ID registered with Navigation.registerScreen
                        //title: "#Rechercher", // navigation bar title of the pushed screen (optional)
                        animationType: 'none',
                        backButtonHidden: true,
                        passProps:{
                            onClickClose: () => navigator.dismissModal({animationType: 'none'}),
                        },
                        navigatorButtons: Nav.CANCELABLE_SEARCH_MODAL,
                    });
                    break;
            }
        }
    }


    componentDidMount() {
        setTimeout(() => {
            if (this.appTourTargets.length > 0) {
                // let appTourSequence = new AppTourSequence();
                // this.appTourTargets.forEach(appTourTarget => {
                //     appTourSequence.add(appTourTarget);
                // });
                //
                // AppTour.ShowSequence(appTourSequence);
            }

        }, 5000);
    }

    render() {

        return (
            <View>
                <View>
                    <LineupListScreen
                        userId={currentUserId()}
                        onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                        onSavingPressed={(saving) => this.onSavingPressed(saving)}
                        navigator={this.props.navigator}
                        //renderItem={(item)=>this.renderListItem(item, n, padding)}
                        scrollUpOnBack={super.isVisible() ? ()=>false : null}
                        cannotFetch={!super.isVisible()}
                        visibility={super.getVisibility()}
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
                                    renderSectionHeaderChildren:() => <AddLineupComponent/>,
                                    renderItem: ({item})=>this.renderListItem(item, {withMenuButton: true, withLineupTitle: true})
                                },
                            ];
                        }}
                        renderSectionHeader={({section}) => this.renderSectionHeader(section)}
                        ItemSeparatorComponent={()=> <View style={{margin: 6}} />}
                        feedId={"home list"}
                    />

                </View>

                {this.displayFloatingButton() && this.renderFloatingButton()
                }

                <View >
                    {this.renderChangeTitleModal()}
                </View>
            </View>
        );
    }


    renderFloatingButton() {
        let floating = <ActionButton
            buttonColor={Colors.green}
            onPress={() => {
                this.onFloatingButtonPressed()
            }}
            ref={ref=>{
                // let appTourTarget = AppTourView.for(ref, {
                //     primaryText: 'This is a target button 1',
                //     secondaryText: 'We have the best targets, believe me'
                // });

                //this.appTourTargets.push(appTourTarget);
            }}
        />;


        return floating;
        //return appTourTarget;
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
                paddingBottom: 15,
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

    _closeChangeNameModal = ()=> this.setState({changeLinupTitleId: null});

    renderChangeTitleModal() {
        let {id, name} = this.state.changeLinupTitleId || {};


        let visible = !!id;

        return <Modal
            isVisible={visible}
            avoidKeyboard={true}
            backdropOpacity={0.3}
            onBackButtonPress={()=> {this._closeChangeNameModal(); return true;}}
            onBackdropPress={this._closeChangeNameModal}
        >
            <View style={{ alignItems: 'center'}}>
                <View style={{ backgroundColor: "white", padding: 12, borderRadius: 6, width: '100%'}}>
                    <Text style={{fontSize: 16, marginBottom: 12}}>Changer le nom de cette liste:</Text>
                    <SmartInput
                        execAction={(input: string) => this.requestChangeName(id, input)}
                        placeholder={"create_list_controller.placeholder"}
                        defaultValue={name}
                        button={<Text>{i18n.t("actions.change")}</Text>}
                        returnKeyType={'done'}
                    />
                </View>
            </View>
        </Modal>;
    }

    requestChangeName(lineupId: Id, name: string) {
        let editedLineup = {id: lineupId, name};

        return this.props.dispatch(patchLineup(editedLineup))
            .then(()=> {
                this.setState({changeLinupTitleId: null})
            })
            .then(()=> Snackbar.show({title: i18n.t("activity_item.button.modified_list")}))
            ;
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
                {this.renderList(item.savings)}
            </View>

        )
    }

    renderEmptyList() {
        let result = [];
        for (let i = 0; i < 5; i++) {
            result.push(<View style={[
                LineupCellSaving.styles.cell,
                {
                    backgroundColor: Colors.grey3,
                    marginRight: 10,
                    opacity: 1 - (0.2 * i)
                }
            ]}/>);
        }
        return (<GTouchable onPress={() => this.onFloatingButtonPressed()}>
            <View style={{flexDirection: 'row', paddingLeft: 15}}>{result}</View>
        </GTouchable>);
    }

    renderList(savings) {

        if (_.isEmpty(savings)) {
            return this.renderEmptyList()
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

    // renderMenuButton2(item, padding) {
    //     if (item.id === currentGoodshboxId()) return null;
    //
    //     // console.log("paddings:" + stylePadding(padding, 12));
    //
    //     return <View style={{position: "absolute", right: 0, margin: 0}}>
    //         <Menu>
    //             <MenuTrigger>
    //                 {/*<Icon name="md-more" size={25} style={{...stylePadding(padding, 12)}}*/}
    //                 {/*color={Colors.blue}/>*/}
    //                 <View style={{...stylePadding(padding, 14)}}>
    //                     <Image
    //                         source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
    //                 </View>
    //
    //             </MenuTrigger>
    //             <MenuOptions>
    //                 <MenuOption onSelect={() => setTimeout(()=>this.deleteLineup(item))} text={i18n.t("actions.change")}/>
    //                 <MenuOption onSelect={() => setTimeout(() => this.changeTitle(item))} text={i18n.t("actions.change_title")}/>
    //             </MenuOptions>
    //         </Menu>
    //     </View>;
    // }



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
        return this.props.dispatch(LINEUP_DELETION.pending({lineupId}, {delayMs, lineupId}))
            .then(pendingId => {
                Snackbar.show({
                        title: i18n.t("activity_item.button.deleted_list"),
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

    changeTitle(lineup: List) {
        let {id, name} = lineup;
        this.setState({changeLinupTitleId: {id, name}});
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
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    onSavingPressed(saving: Saving) {
        this.props.navigator.showModal({
            screen: 'goodsh.ActivityDetailScreen',
            passProps: {activityId: saving.id, activityType: saving.type},
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
        // }
    }

    onFloatingButtonPressed() {
        startAddItem(this.props.navigator, currentGoodshboxId());
    }
}

const screen = HomeScreen;


export {screen};
