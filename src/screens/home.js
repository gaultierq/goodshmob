// @flow

import React, {Component} from 'react';
import {Image, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View} from 'react-native';

import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import ActionButton from 'react-native-action-button';
import {screen as LineupList} from './lineups'
import type {Id, Saving} from "../types";
import {Item, List} from "../types"
import Snackbar from "react-native-snackbar"
import i18n from '../i18n/i18n'
import * as UI from "./UIStyles";
import CurrentUser from "../CurrentUser"
import Icon from 'react-native-vector-icons/Ionicons';
import {createLineup, saveItem} from "./actions";
import {SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';


let DEEPLINK_SEARCH_TEXT_CHANGED = 'internal/home/search/change';
let DEEPLINK_SEARCH_CLOSE = 'internal/home/search/close';

type Props = {
    userId: Id,
    navigator: any
};

type State = {
    pendingItem?: Item,
    pendingList?: List,
    isCreatingLineup?: boolean,
    isSearching?: boolean,
    searchToken?: string,

    isAddingLineup?: boolean, //request of adding
    newLineupTitle?: string
};

class HomeScreen extends Component<Props, State> {

    state = {};

    static navigatorStyle = UI.NavStyles;

    constructor(props){
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.log("Home:NavEvent: "+JSON.stringify(event));
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            switch (event.id) {
                case 'cancel_add':
                    this.setState({
                        pendingItem: null,
                        pendingList: null
                    });
                    break;
                case 'profile':
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
                case 'search':
                    this.setState({isSearching: true});
                    break;
            }
        }

        //HACK
        if (event.type === 'DeepLink') {
            const payload = event.payload; // (optional) The payload

            switch (event.link) {
                case DEEPLINK_SEARCH_TEXT_CHANGED:
                    this.setState({searchToken: payload});
                    break;
                case DEEPLINK_SEARCH_CLOSE:
                    this.setState({isSearching: false});
                    break;
            }
        }
    }

    render() {

        const {pendingItem, pendingList} = this.state;


        this.renderNav();


        let userId = CurrentUser.id;

        if (!userId) throw "currentUserId is not defined";

        return (
            <MainBackground>
                <View>
                    {pendingItem && !pendingList && <Text style={styles.selectAList}>Sélectionnez une liste:</Text>}
                    <LineupList
                        userId={userId}
                        filter={this.state.searchToken}
                        onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                        onSavingPressed={(saving) => this.onSavingPressed(saving)}
                        //onAddInLineupPressed={(this.state.pendingItem) ? null : (lineup) => this.addInLineup(lineup)}
                        canFilterOverItems={() => !this.state.pendingItem}
                        ListHeaderComponent={this.renderHeader()}
                        navigator={this.props.navigator}
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
            </MainBackground>
        );
    }

    renderNav() {
        const {navigator} = this.props;
        let leftButtons, rightButtons, navBarCustomView;

        if (this.state.isSearching) {
            // style = {
            //     navBarCustomView: 'goodsh.HomeNavBar',
            // };
            navBarCustomView='goodsh.HomeNavBar';
            leftButtons = [];
            rightButtons = [];
        }
        else if (this.state.pendingItem || this.state.pendingList) {
            navBarCustomView = null;
            leftButtons = [];
            rightButtons = [
                {
                    title: 'Cancel',
                    id: 'cancel_add' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                }];
        }
        else {
            navBarCustomView = null;
            leftButtons = [{
                icon: require('../img/drawer_community.png'),
                id: 'profile'
            }];
            rightButtons = [
                {
                    icon: require('../img/bottom_bar_search.png'),
                    id: 'search'
                }
            ];
        }

        navigator.setStyle({navBarCustomView});
        navigator.setButtons({
            leftButtons,
            rightButtons,
            animated: true// does the change have transition animation or does it happen immediately (optional)
        });

        //HACK. event listener is unsubscribed for some reason...
        setTimeout(()=>navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this)));
    }

    createLineup() {
        if (!this.state.newLineupTitle) return;
        if (this.state.isAddingLineup) return;
        this.setState({isAddingLineup: true});
        this.props.dispatch(createLineup(this.state.newLineupTitle))
            .then(()=> {
                this.setState({
                    isCreatingLineup: false,
                    newLineupTitle: ""
                })
            }, (err) => console.log(err))
            .then(()=> {
                this.setState({
                    isAddingLineup: false,
                })
            })

        ;
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

    onLineupPressed(lineup: List) {
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

    onSavingPressed(saving: Saving) {
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
                onItemSelected: (item: Item) => {
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
        let pendingItem = this.state.pendingItem;
        let pendingList = this.state.pendingList;

        if (pendingItem && pendingList) {
            console.info(`${pendingItem.title} waiting to be added in ${pendingList.name}`);
            this.props
                .dispatch(saveItem(pendingItem.id, pendingList.id, ))
                .then(() => {
                    Snackbar.show({
                        title: i18n.t('shared.goodsh_saved'),
                    });
                    return this.setState({pendingItem: null, pendingList: null});
                });
        }
    }

    //TODO: extract lineup card style
    renderHeader() {
        //if (this.isSearching()) return null;
        if (!this.isCurrentUser()) return null;
        if (this.state.isCreatingLineup) {

            return (
                <View style={[UI.CARD(), styles.header]}>
                    <TextInput
                        autoFocus
                        editable={!this.state.isAddingLineup}
                        style={styles.input}

                        onSubmitEditing={this.createLineup.bind(this)}
                        onEndEditing={()=>this.setState({isCreatingLineup: false})}
                        value={this.state.newLineupTitle}
                        onChangeText={newLineupTitle => this.setState({newLineupTitle})}
                        placeholder={i18n.t("create_list_controller.placeholder")}
                    />
                </View>
            );
        }

        return (<TouchableWithoutFeedback onPress={() => {this.setState({isCreatingLineup: true})}}>
            <View style={
                [UI.CARD(), styles.header]
            }>
                <Image source={require('../img/plus.png')}
                       resizeMode="contain"
                       style={{
                           width: 20,
                           height: 20,
                           marginRight: 10
                       }}
                />
                <Text>{i18n.t('create_list_controller.title')}</Text>
            </View>
        </TouchableWithoutFeedback>);
    }

    isCurrentUser() {
        return true;
    }
}


const mapStateToProps = (state, ownProps) => ({
});


const screen = connect(mapStateToProps)(HomeScreen);

type NavProps = {
    onChangeText: (token: string) => void,
    navigator: any
};

type NavState = {
    input:? string,
};


//connect -> redux
class HomeNavBar extends Component<NavProps, NavState> {

    state = {input: null};

    render() {

        //if (this.props.test !== "test") throw "tg";

        return (
            <SearchBar
                lightTheme
                onChangeText={this.onChangeText.bind(this)}
                onClearText={this.onClearText.bind(this)}
                placeholder={i18n.t('lineups.search.placeholder')}
                clearIcon={{color: '#86939e'}}
                containerStyle={styles.searchContainer}
                inputStyle={styles.searchInput}
                autoCapitalize='none'
                autoCorrect={false}
            />
        );

    }

    onChangeText(input: string) {
        this.setState({input});
        //because function props are not currently allowed by RNN

        //this.props.onChangeText(input);
        //become->
        Navigation.handleDeepLink({
            link: DEEPLINK_SEARCH_TEXT_CHANGED,
            payload: input
        });
    }

    onClearText() {
        Navigation.handleDeepLink({
            link: DEEPLINK_SEARCH_CLOSE
        });
    }

    isSearching() {
        return this.state.isSearching;
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
    selectAList: {
        padding: 10,
        fontFamily: 'Chivo-Light',
        color: 'black',
        fontSize: 20,
        alignSelf: "center",
        backgroundColor:"transparent"
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: 'white',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    input:{
        height: 40,
    },
    inputContainer:{
        // height: 40,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 14,
        margin: 10,
        backgroundColor: 'white'
    },
});

export {screen, HomeNavBar};