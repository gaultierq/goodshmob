// @flow

import React, {Component} from 'react';
import {Image, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View} from 'react-native';

import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import ActionButton from 'react-native-action-button';
import {screen as LineupList} from './lineups'
import type {Id, Saving} from "../types";
import {Item, List} from "../types"
import Snackbar from "react-native-snackbar"
import i18n from '../i18n/i18n'
import * as UI from "./UIStyles";
import CurrentUser, {currentUserId} from "../CurrentUser"
import {createLineup, saveItem} from "./actions";
import {SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import ItemCell from "./components/ItemCell";
import LineupCell from "./components/LineupCell";


let DEEPLINK_SEARCH_TEXT_CHANGED = 'internal/home/search/change';
let DEEPLINK_SEARCH_CLOSE = 'internal/home/search/close';

type Props = {
    userId: Id,
    navigator: any
};

type State = {
    pendingItem?: Item,
    pendingList?: List,
    isSearching?: boolean,
    searchToken?: string,

    isCreatingLineup?: boolean, //create lineup mode
    isAddingLineup?: boolean, //request of adding
    newLineupTitle?: string
};

class HomeScreen extends Component<Props, State> {

    state : State = {};

    static navigatorStyle = UI.NavStyles;

    lineupInput: TextInput;

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
                    //
                    //this.setState({isSearching: true});
                    let navigator = this.props.navigator;


                    let renderItem = ({item})=> {

                        let isLineup = item.type === 'lists';

                        //FIXME: item can be from search, and not yet in redux store
                        //item = buildData(this.props.data, item.type, item.id) || item;

                        //if (!item) return null;

                        if (isLineup) {
                            let lineup: List = item;
                            return (
                                <TouchableWithoutFeedback
                                    onPress={this.onLineupPressed}
                                >
                                    <View>
                                        <LineupCell
                                            lineup={lineup}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
                        else {
                            let saving = item;

                            let resource = saving.resource;

                            //TODO: this is hack
                            if (!resource) return null;

                            return (
                                <ItemCell
                                    item={resource}
                                    onPressItem={()=>this.onSavingPressed(saving)}
                                />
                            )
                        }
                    };

                    navigator.showModal({
                        screen: 'goodsh.AlgoliaSearchScreen', // unique ID registered with Navigation.registerScreen
                        title: "Rechercher", // navigation bar title of the pushed screen (optional)
                        animationType: 'none',
                        passProps:{
                            onClickClose: () => navigator.dismissModal({animationType: 'none'}),
                            categories: [
                                {
                                    type: "savings",
                                    query: {
                                        indexName: 'Saving_development',
                                        params: {
                                            facets: "[\"list_name\"]",
                                            filters: 'user_id:' + currentUserId(),
                                        }
                                    },
                                    renderItem,
                                    tabName: "lol"
                                }
                            ],
                            placeholder: "search_bar.me_placeholder"

                        },
                    });

                    break;
            }
        }

        // type: SearchCategoryType,
        //     query: *,
        // renderItem: (item: *) => Node,
        //     tabName: i18Key

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

        this.renderNav();

        return (
            <MainBackground>
                <View>
                    {/*{this.isSelectingAList() && <Text style={styles.selectAList}>Sélectionnez une liste:</Text>}*/}

                    {/*{this.renderHeader()}*/}

                    <View>
                        <LineupList
                            userId={CurrentUser.id}
                            filter={this.state.searchToken}
                            onLineupPressed={(lineup) => this.onLineupPressed(lineup)}
                            onSavingPressed={(saving) => this.onSavingPressed(saving)}
                            canFilterOverItems={() => !this.state.pendingItem}
                            navigator={this.props.navigator}
                            ListHeaderComponent={this.renderHeader()}
                        />
                    </View>

                </View>

                {this.displayFloatingButton() &&
                <ActionButton
                    buttonColor={UI.Colors.green}
                    onPress={() => { this.onFloatingButtonPressed() }}
                />
                }
            </MainBackground>
        );
    }

    isSelectingAList() {
        const {pendingItem, pendingList} = this.state;
        return pendingItem && !pendingList;
    }

    renderNav() {
        const {navigator} = this.props;
        let title, leftButtons, rightButtons, navBarCustomView;

        if (this.state.isSearching) {
            title = null;
            navBarCustomView='goodsh.HomeNavBar';
            leftButtons = [];
            rightButtons = [];
        }
        else if (this.state.pendingItem || this.state.pendingList) {
            title = this.isSelectingAList() ?
                {title: "Sélectionnez une liste:"} :
                {titleImage: require('../img/screen_title_home.png')};
            navBarCustomView = null;
            leftButtons = [];
            rightButtons = [
                {
                    title: 'Cancel',
                    id: 'cancel_add' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                }];
        }
        else {
            title = {titleImage: require('../img/screen_title_home.png')};
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

        if (title) {
            navigator.setTitle(title);
        }
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
                },
                (err) => {
                    //this.lineupInput.focus();
                    console.log(err);
                })
            .then(()=> {
                this.setState({
                    isAddingLineup: false,
                })
            })

        ;
    }

    displayFloatingButton() {
        return !this.state.pendingItem && !this.state.isCreatingLineup;
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
        if (this.isSelectingAList()) {
            return <View/>;
        }
        if (this.state.isCreatingLineup) {
            let editable = !this.state.isAddingLineup;

            //FIXME: changing color of the text doesnt work ?!
            return (
                <View style={[UI.CARD(6), styles.header]}>
                    <TextInput
                        autoFocus
                        editable={editable}
                        style={[styles.input, (editable ? {color: "black"} : {color: "grey"})]}
                        onSubmitEditing={this.createLineup.bind(this)}
                        onEndEditing={()=>{
                            if (!this.state.isAddingLineup) this.setState({isCreatingLineup: false})
                        }}
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
                <Text
                    style={[
                        styles.headerText,
                        {color: UI.Colors.grey2},
                        Platform.OS === 'ios'? {lineHeight: 40} : {height: 40}
                    ]}
                >{i18n.t('create_list_controller.title')}</Text>
            </View>
        </TouchableWithoutFeedback>);
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
                autoFocus
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
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    input:{
        height: 40,
        width: "100%",
        fontFamily: 'Chivo',
        fontSize: 18,
    },
    colorActive:{
        color: 'green',
    },
    colorInactive:{
        color: 'black',
    },
    headerText:{
        flex: 1,
        textAlignVertical: 'center',
        fontFamily: 'Chivo',
        fontSize: 18,
    },
    inputContainer:{
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 14,
        margin: 10,
        backgroundColor: 'white'
    },
});

export {screen, HomeNavBar};