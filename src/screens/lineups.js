// @flow

import React, {Component} from 'react';
import {
    StyleSheet, TextInput, Image,
    View, Text, ScrollView, ActivityIndicator,
    FlatList, RefreshControl, TouchableHighlight} from 'react-native';
import Modal from 'react-native-modal'

import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import LineupCell from "./components/LineupCell";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import i18n from '../i18n/i18n'
import * as UI from "../screens/UIStyles";
import Button from 'apsl-react-native-button'
import {TP_MARGINS} from "./UIStyles";


class LineupListScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
        this.state= {
            isCreatingLineup: false,
            modalVisible: false
        }
    }

    componentDidMount() {
        this.load();
    }

    load() {
        this.props.dispatch(actions.loadLineups());
    }

    loadMore() {
        if (this.isLoadingMore()) return;
        if (!this.props.lineupList.links) return;
        let nextUrl = this.props.lineupList.links.next;
        console.log("Next url:" + nextUrl);

        //data.meta;
        this.props.dispatch(actions.loadMoreLineups(nextUrl));
    }

    render() {
        let lineupList = this.props.lineupList;

        let lineups = lineupList.list;

        return (
            <MainBackground>
                <ScrollView>
                    <View style={{}}>
                        <FlatList
                            data={lineups}
                            renderItem={this.renderItem.bind(this)}
                            keyExtractor={this.keyExtractor}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.isLoading()}
                                    onRefresh={this.onRefresh.bind(this)}
                                />
                            }
                            onEndReached={ this.onEndReached.bind(this) }
                            onEndReachedThreshold={0}
                            ListHeaderComponent={this.renderHeader()}
                            ListFooterComponent={this.isLoadingMore() &&

                            <ActivityIndicator
                                animating = {this.isLoadingMore()}
                                size = "small"
                            />}
                        />
                        {this.renderModal()}
                    </View>
                </ScrollView>
            </MainBackground>
        );
    }

    //TODO: extract lineup card style
    renderHeader() {
        return <TouchableHighlight onPress={() => {this.setModalVisible(true)}}>
            <View style={
                Object.assign({}, UI.CARD(12),{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    marginTop: 10,
                    marginBottom: 10,
                })}>
                <Image source={require('../img/plus.png')}
                       resizeMode="contain"
                       style={{
                           width: 20,
                           height: 20,
                       }}
                />
                <Text>{i18n.t('create_list_controller.title')}</Text>
            </View>
        </TouchableHighlight>
            ;
    }

    isLoadingMore() {
        return !!this.props.request.isLoading[actiontypes.FETCH_MORE_LINEUPS.name()];
    }

    isLoading() {
        return !!this.props.request.isLoading[actiontypes.FETCH_LINEUPS.name()];
    }


    renderItem(item) {
        let it = item.item;
        return <TouchableHighlight onPress={() => this.seeLineupDetails(it)}>
            <View>
                <LineupCell
                    onPressItem={() => this.navToLineupDetail(it)}
                    lineupId={it.id}
                />
            </View>
        </TouchableHighlight>
    }

    seeLineupDetails(lineup) {
        console.info("onPressItem: " + JSON.stringify(lineup));
        this.props.navigator.push({
            screen: 'goodsh.LineupDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "Lineup Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {lineupId: lineup.id}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
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

    onRefresh() {
        this.load();
    }
    createLineup() {
        if (!this.state.newLineupName) return;
        if (this.state.isCreatingLineup) return;
        this.setState({isCreatingLineup: true});
        this.props.dispatch(actions.createLineup(this.state.newLineupName))
            .then(()=> this.setModalVisible(false)).then(()=> this.setState({isCreatingLineup: false}));
    }

    onEndReached() {
        if (this.props.lineupList.hasMore) {
            this.loadMore();
        }
        else {
            console.info("end of feed")
        }

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    lineupList: state.lineupList,
    request: state.request
});

const actiontypes = (() => {
    const FETCH_LINEUPS = new Api.ApiAction("fetch_lineups");
    const FETCH_MORE_LINEUPS = new Api.ApiAction("fetch_more_lineups");
    const CREATE_LINEUP = new Api.ApiAction("create_lineup");

    return {FETCH_LINEUPS, FETCH_MORE_LINEUPS, CREATE_LINEUP};
})();


const actions = (() => {
    return {
        loadLineups: () => {
            let call = new Api.Call().withMethod('GET')
                .withRoute("lists")
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actiontypes.FETCH_LINEUPS);
        },

        loadMoreLineups:(nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actiontypes.FETCH_MORE_LINEUPS);
        },
        createLineup: (listName) => {
            let call = new Api.Call()
                .withMethod('POST')
                .withRoute("lists")
                .withBody({
                    "list": {
                        "name": listName
                    }
                });

            return call.disptachForAction(actiontypes.CREATE_LINEUP);
        },
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actiontypes.FETCH_LINEUPS, fetchMore: actiontypes.FETCH_MORE_LINEUPS};
        state = Api.reduceList(state, action, desc);
        switch (action.type) {
            case actiontypes.CREATE_LINEUP.success():
                let payload = action.payload;
                let {id, type} = payload.data;
                let newItem = {id, type};

                let list = state.list.map((val, index) => {
                    return (index === 1) ? newItem : val;
                });
                state = state.merge({list});
                break;
        }

        return state;
    }
})();

let screen = connect(mapStateToProps)(LineupListScreen);

export {reducer, screen};