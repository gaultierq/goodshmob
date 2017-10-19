// @flow

import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import ActionButton from 'react-native-action-button';
import {screen as LineupList} from './lineups'
import List from "../models/List";
import * as types from "../types"
import Snackbar from "react-native-snackbar"
import i18n from '../i18n/i18n'
import * as UIStyles from "./UIStyles";
import CurrentUser from "../CurrentUser"
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal'
import Button from 'apsl-react-native-button'
import {TP_MARGINS} from "./UIStyles";
import {createLineup, saveItem} from "./actions";
import Item from "../models/Item";

class HomeScreen extends Component {

    static navigationOptions = { title: 'Welcome', header: null };


    state : {
        pendingItem: Item,
        pendingList: List,
        isCreatingLineup: boolean,
        modalVisible: boolean,
        newLineupName: null | string
    };

    constructor(props){
        super(props);
        this.state = {
            pendingItem: null,
            pendingList: null,
            isCreatingLineup: false,
            modalVisible: false,
            newLineupName: null
        };

        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    static navigatorStyle = UIStyles.NavStyles;

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            // if (event.id === 'cancel_add') { // this is the same id field from the static navigatorButtons definition
            //     this.setState({
            //         pendingItem: null,
            //         pendingList: null
            //     });
            // }
            switch (event.id) {
                case 'cancel_add':
                    this.setState({
                        pendingItem: null,
                        pendingList: null
                    });
                    break;
                case 'profile':
                    this.props.navigator.push({
                        screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
                        title: "Mes amis", // navigation bar title of the pushed screen (optional)
                        passProps: {
                        },
                    });
                    break;
            }
        }
    }

    render() {
        let rightButtons = this.getRightButtonDefinition();

        this.props.navigator.setButtons({
            leftButtons: [], // see "Adding buttons to the navigator" below for format (optional)
            rightButtons,
            animated: false// does the change have transition animation or does it happen immediately (optional)
        });


        //user_id => user_object ?
        // yes: user.list = base feed data
        // no: get_user{include:list}
        // fetch more => grow user object
        return (
            <MainBackground>
                <View>
                    <LineupList
                        userId={CurrentUser.id}
                        onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                        onSavingPressed={(saving) => this.onSavingPressed(saving)}
                        //onAddInLineupPressed={(this.state.pendingItem) ? null : (lineup) => this.addInLineup(lineup)}
                        canFilterOverItems={() => !this.state.pendingItem}
                    />

                </View>

                {this.displayFloatingButton() &&
                <ActionButton
                    buttonColor="rgba(231,76,60,1)"
                    // onPress={() => { this.onFloatingButtonPressed() }}
                >
                    <ActionButton.Item buttonColor='#3498db' title="Ajouter quelquechose" onPress={this.onFloatingButtonPressed.bind(this)}>
                        <Icon name="md-notifications-off" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#1abc9c' title="Ajouter une liste" onPress={() => this.setModalVisible(true)}>
                        <Icon name="md-done-all" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                </ActionButton>
                }

                {this.renderModal()}

            </MainBackground>
        );
    }

    renderModal() {
        return (
            <Modal
                isVisible={this.state.modalVisible}
            >
                <View style={{
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }}>
                    <View>
                        <Text>Add a new lineup</Text>
                        <Text>Be creative ;)</Text>

                        <TextInput
                            style={{...TP_MARGINS(20), height: 40, borderColor: 'gray', borderWidth: 1}}
                            onChangeText={(text) => this.setState({newLineupName: text})}
                            value={this.state.text}
                        />

                        <Button
                            isLoading={this.state.isCreatingLineup}
                            isDisabled={!this.state.newLineupName}
                            onPress={this.createLineup.bind(this)}>
                            <Text>Add</Text>
                        </Button>

                        <Button
                            onPress={() => {
                                this.setModalVisible(!this.state.modalVisible)
                            }}>
                            <Text>Cancel</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        );
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    createLineup() {
        if (!this.state.newLineupName) return;
        if (this.state.isCreatingLineup) return;
        this.setState({isCreatingLineup: true});
        this.props.dispatch(createLineup(this.state.newLineupName))
            .then(()=> this.setModalVisible(false)).then(()=> this.setState({isCreatingLineup: false}));
    }

    getRightButtonDefinition() {
        return (this.state.pendingItem || this.state.pendingList) ? [
            {
                title: 'Cancel',
                id: 'cancel_add' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
            }] : [
            {
                icon: require('../img/drawer_community.png'),
                id: 'profile'
            }
        ];
    }

    displayFloatingButton() {
        return this.state.pendingItem === null;
    }

    addInLineup(lineup: List) {
        this.setState({pendingList: lineup}, () => {
            console.log(`add in lineup: ${lineup.id}`);
            this.displaySearchScreen(()=> {
                this.setState({pendingList: null});
            });
        });

    }

    onLineupPressed(lineup:types.List) {
        if (this.state.pendingItem) {
            this.setState({pendingList: lineup}, () => this.resolveAdd());
        }
        else {

            console.info("on linup pressed: " + JSON.stringify(lineup));
            this.props.navigator.push({
                screen: 'goodsh.SavingsScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: lineup.id,
                },
            });
        }
    }

    onSavingPressed(saving:types.Saving) {
        if (this.state.pendingItem) {
            throw new Error("This should not happen");
        }
        else {
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
        }
    }

    onFloatingButtonPressed() {
        this.displaySearchScreen();
    }

    displaySearchScreen(onCancel?) {
        this.props.navigator.showModal({
            screen: 'goodsh.SearchScreen', // unique ID registered with Navigation.registerScreen
            title: // navigation bar title of the pushed screen (optional)
                this.state.pendingList ?
                    i18n.t("tabs.search.title_in", {list_name: this.state.pendingList.name}) :
                    i18n.t("tabs.search.title"),
            passProps: {
                onItemSelected: (item: types.Item) => {
                    this.props.navigator.dismissAllModals();
                    console.info("item selected: " + JSON.stringify(item.title));

                    //TODO: add it to redux
                    this.setState({pendingItem: item}, () => this.resolveAdd());
                },
                onCancel: () => {
                    this.props.navigator.dismissAllModals();
                    onCancel && onCancel();
                }

            }, // Object that will be passed as props to the pushed screen (optional)
        });
    }

    resolveAdd() {
        //action blabla
        if (this.state.pendingItem && this.state.pendingList) {
            console.info(`${this.state.pendingItem.title} waiting to be added in ${this.state.pendingList.name}`);
            this.props
                .dispatch(saveItem(this.state.pendingItem.id, this.state.pendingList.id, ))
                .then(() => {
                    Snackbar.show({
                        title: i18n.t('shared.goodsh_saved'),
                    });
                    return this.setState({pendingItem: null, pendingList: null});
                });
        }
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
});

const mapStateToProps = (state, ownProps) => ({
});

// const actiontypes = (() => {
//
//     const SAVE_ITEM = new ApiAction("save_item");
//     return {SAVE_ITEM};
// })();
//

// const actions = (() => {
//     return {
//         saveItem: saveItem
//         // saveItem: (itemId: Id, lineupId: Id, privacy = 0, description = '') => {
//         //
//         //     let body = {
//         //         saving: { list_id: lineupId, privacy}
//         //     };
//         //     if (description) {
//         //         Object.assign(body, description)
//         //     }
//         //     console.log("saving item, with body:");
//         //     console.log(body);
//         //
//         //     let call = new Api.Call()
//         //         .withMethod('POST')
//         //         .withRoute(`items/${itemId}/savings`)
//         //         .withBody(body)
//         //         .addQuery({'include': '*.*'});
//         //
//         //     return call.disptachForAction2(actiontypes.SAVE_ITEM);
//         // },
//     };
// })();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        return state;
    }
})();

let screen = connect(mapStateToProps)(HomeScreen);

export {reducer, screen};