// @flow

import React, {Component} from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import {connect} from "react-redux";
import ActionButton from 'react-native-action-button';
import {DELETE_LINEUP, EDIT_LINEUP, screen as LineupList} from './lineuplist'
import type {Id, Saving} from "../types";
import {List} from "../types"
import Snackbar from "react-native-snackbar"
import * as UI from "./UIStyles";
import {currentGoodshboxId, currentUserId} from "../CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import LineupCell from "./components/LineupCell";
import Icon from 'react-native-vector-icons/Ionicons';
import * as Api from "../utils/Api";
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import Modal from 'react-native-modal'
import type {Visibility} from "./additem";
import AddLineupComponent from "./components/addlineup";
import {startAddItem} from "./actions";
import * as Nav from "./Nav";
import {MainBackground} from "./UIComponents";
import SmartInput from "./components/SmartInput";


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
class HomeScreen extends Component<Props, State> {


    static navigatorButtons = {
        leftButtons: [
            {
                icon: require('../img/profil.png'),
                id: 'profile'
            }
        ],
        rightButtons: [
            {
                icon: require('../img/bottom_bar_search.png'),
                id: 'search'
            }
        ],
    };

    state : State = {};

    constructor(props: Props){
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.debug("home:onNavigatorEvent" + JSON.stringify(event));

        switch(event.id) {
            case 'willAppear':
                this.props.navigator.setDrawerEnabled({side: 'left', enabled: true});
                this.props.navigator.setDrawerEnabled({side: 'right', enabled: false});
                break;
            case 'didAppear':
                break;
            case 'willDisappear':
                this.props.navigator.setDrawerEnabled({side: 'left', enabled: false});
                break;
            case 'didDisappear':
                break;
        }
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            switch (event.id) {
                // case 'cancel_add':
                //     this.setState({
                //         pendingItem: null,
                //         pendingList: null
                //     });
                //     break;
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
                        title: "Rechercher", // navigation bar title of the pushed screen (optional)
                        animationType: 'none',
                        passProps:{
                            onClickClose: () => navigator.dismissModal({animationType: 'none'}),
                        },
                        navigatorButtons: {
                            leftButtons: [
                                {
                                    id: Nav.CANCEL,
                                    title: "Cancel"
                                }
                            ],
                        },
                    });

                    break;
            }
        }
    }

    render() {


        return (
            <MenuContext>
                <MainBackground>

                    <View>
                        <LineupList
                            userId={currentUserId()}
                            onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                            onSavingPressed={(saving) => this.onSavingPressed(saving)}
                            navigator={this.props.navigator}
                            ListHeaderComponent={this.renderHeader()}
                            renderItem={(item)=>this.renderListItem(item)}
                        />

                    </View>

                    {this.displayFloatingButton() &&
                    <ActionButton
                        buttonColor={UI.Colors.green}
                        onPress={() => { this.onFloatingButtonPressed() }}
                    />
                    }

                    <View >
                        {this.renderChangeTitleModal()}
                    </View>
                </MainBackground>
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
            onBackdropPress={this._closeChangeNameModal}
        >
            <View style={{ alignItems: 'center'}}>
                <View style={{ backgroundColor: "white", padding: 12, borderRadius: 6, width: '100%'}}>
                    <Text style={{fontSize: 16, marginBottom: 12}}>Changer le nom de cette liste:</Text>
                    <SmartInput
                        execAction={(input: string) => this.requestChangeName(id, input)}
                        placeholder={"create_list_controller.placeholder"}
                        defaultValue={name}
                        button={<Text>Changer</Text>}
                    />
                </View>
            </View>
        </Modal>;
    }

    requestChangeName(lineupId: Id, name: string) {
        let editedLineup = {id: lineupId, name};

        return this.props.dispatch(actions.patchLineup(editedLineup))
            .then(()=> {
                this.setState({changeLinupTitleId: null})
            })
            .then(()=> Snackbar.show({title: "Liste modifiée"}))
            ;

    }

    renderListItem(item) {
        return (<TouchableOpacity
            onPress={() => {
                this.props.navigator.push({
                    screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                    passProps: {
                        lineupId: item.id,
                    },
                });
            }}>
            <LineupCell
                lineup={item}
                moreComponent={
                    <Menu>
                        <MenuTrigger>
                            <Icon name="md-more" size={25} style={{padding: 5, paddingLeft: 15}} color={UI.Colors.blue} />
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => this.deleteLineup(item)} text='Delete' />
                            <MenuOption onSelect={() => this.changeTitle(item)} text='Changer le titre' />
                        </MenuOptions>
                    </Menu>
                }
            />

        </TouchableOpacity>)
    }


    deleteLineup(lineup: List) {
        this.props
            .dispatch(actions.deleteLineup(lineup))
            .then(()=> Snackbar.show({title: "Liste effacée"}));
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
            title: "Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
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
    renderHeader() {
        return <AddLineupComponent/>;
    }
}


const screen = HomeScreen;


const actions = {
    deleteLineup: (lineup) => {
        let call = new Api.Call()
            .withMethod('DELETE')
            .withRoute(`lists/${lineup.id}`);

        return call.disptachForAction2(DELETE_LINEUP, {lineupId: lineup.id});
    },
    patchLineup: (editedLineup) => {
        let call = new Api.Call()
            .withMethod('PATCH')
            .withRoute(`lists/${editedLineup.id}`)
            .withBody(editedLineup)
        ;
        return call.disptachForAction2(EDIT_LINEUP, {lineupId: editedLineup.id});
    },
};


const styles = StyleSheet.create({});

export {screen};