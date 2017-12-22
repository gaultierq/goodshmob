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
import type {Id, Saving} from "../../types";
import {List} from "../../types"
import Snackbar from "react-native-snackbar"
import {stylePadding} from "../UIStyles";
import {currentGoodshboxId, currentUserId} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import LineupCell from "../components/LineupCell";
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import Modal from 'react-native-modal'
import type {Visibility} from "./additem";
import AddLineupComponent from "../components/addlineup";
import {LINEUP_DELETION, patchLineup} from "../lineup/actions";
import * as Nav from "../Nav";
import {startAddItem} from "../Nav";
import SmartInput from "../components/SmartInput";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import {PROFILE_CLICKED} from "../components/MyAvatar";
import {SFP_TEXT_MEDIUM} from "../fonts";


type Props = {
    userId: Id,
    navigator: any
};

type State = {
    newLineupTitle?: string,
    newLineupPrivacy?: Visibility,
    changeLinupTitleId?: {id:Id, name: string}
};

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
                        navigatorButtons: {
                            rightButtons: [
                                {
                                    id: Nav.CLOSE_MODAL,
                                    title: "#Cancel"
                                }
                            ],
                            leftButtons: []
                        },
                    });
                    break;
            }
        }
    }


    getPadding() {
        const {width} = Dimensions.get('window');

        let w = 60;
        let n = Math.floor(width / w) + 1;

        let spaceLeft;
        let padding;

        do {
            n--;
            spaceLeft = width - n * w;
            padding = spaceLeft / (n + 2);
        } while (padding < w / 5);
        return {n, padding};
    }

    render() {

        let {n, padding} = this.getPadding();

        return (
            <MenuContext>

                <View>
                    <LineupListScreen
                        userId={currentUserId()}
                        onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                        onSavingPressed={(saving) => this.onSavingPressed(saving)}
                        navigator={this.props.navigator}
                        ListHeaderComponent={this.renderHeader(padding)}
                        renderItem={(item)=>this.renderListItem(item, n, padding)}
                        scrollUpOnBack={super.isVisible() ? ()=>false : null}
                        cannotFetch={!super.isVisible()}
                        visibility={super.getVisibility()}
                        feedId={"home list"}
                    />

                </View>

                {this.displayFloatingButton() &&
                <ActionButton
                    buttonColor={Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />
                }

                <View >
                    {this.renderChangeTitleModal()}
                </View>
            </MenuContext>
        );
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
                        button={<Text>#Changer</Text>}
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
            .then(()=> Snackbar.show({title: "#Liste modifiée"}))
            ;

    }

    renderListItem(item, n, padding) {
        return (<TouchableOpacity
            onPress={() => {
                this.props.navigator.push({
                    screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        lineupId: item.id,
                    },
                });
            }}>
            <View>
                <LineupCell
                    lineup={item}
                    itemCount={n}
                    padding={padding}
                />
                {
                    this.renderMenuButton(item, padding)
                }
            </View>

        </TouchableOpacity>)
    }


    renderMenuButton(item, padding) {
        if (item.id === currentGoodshboxId()) return null;

        // console.log("paddings:" + stylePadding(padding, 12));

        return <View style={{position: "absolute", right: 0, margin: 0}}>
            <Menu>
                <MenuTrigger>
                    {/*<Icon name="md-more" size={25} style={{...stylePadding(padding, 12)}}*/}
                    {/*color={Colors.blue}/>*/}
                    <View style={{...stylePadding(padding, 14)}}>
                        <Image
                            source={require('../../img2/moreDotsGrey.png')} resizeMode="contain"/>
                    </View>

                </MenuTrigger>
                <MenuOptions>
                    <MenuOption onSelect={() => setTimeout(()=>this.deleteLineup(item))} text='#Delete'/>
                    <MenuOption onSelect={() => setTimeout(() => this.changeTitle(item))} text='#Changer le titre'/>
                </MenuOptions>
            </Menu>
        </View>;
    }

    deleteLineup(lineup: List) {
        let delayMs = 3000;
        //deleteLineup(lineup.id, delayMs)
        const lineupId = lineup.id;
        return this.props.dispatch(LINEUP_DELETION.pending({lineupId}, {delayMs, lineupId}))
            .then(pendingId => {
                Snackbar.show({
                        title: "#Liste effacée",
                        duration: Snackbar.LENGTH_LONG,
                        action: {
                            title: '#UNDO',
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
        this.props.navigator.push({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }

    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "#Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../../img2/headerLogoBlack.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {activityId: saving.id, activityType: saving.type}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
        // }
    }

    onFloatingButtonPressed() {
        startAddItem(this.props.navigator, currentGoodshboxId());
    }


//TODO: extract lineup card style
    renderHeader(padding: number) {

        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', margin: padding}}>
                <Text style={{
                    fontSize: 20,
                    fontFamily: SFP_TEXT_MEDIUM
                }}>#My lists</Text>
                <AddLineupComponent/>
            </View>
        );
    }
}


const screen = HomeScreen;


export {screen};