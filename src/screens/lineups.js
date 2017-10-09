// @flow

import React, {Component} from 'react';
import {
    StyleSheet, TextInput, Image,
    View, Text, ActivityIndicator,
    FlatList, RefreshControl, TouchableHighlight} from 'react-native';
import Modal from 'react-native-modal'

import {connect} from "react-redux";
import LineupCell from "./components/LineupCell";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import i18n from '../i18n/i18n'
import * as UI from "../screens/UIStyles";
import Button from 'apsl-react-native-button'
import {TP_MARGINS} from "./UIStyles";
import { SearchBar } from 'react-native-elements'
import build from './redux-object'
import Fuse from 'fuse.js'

class LineupListScreen extends Component {

    props: {
        onLineupPressed: Function,
        onAddInLineupPressed: Function,
        data: Object
    };

    constructor(){
        super();
        this.state= {
            isCreatingLineup: false,
            modalVisible: false,
            filter: null
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
        //let lineups = lineupList.list.map((l) => buildNonNullData(this.props.data, "lists", l.id));
        let ids = lineupList.list.asMutable().map(o=>o.id);
        let lineups = build(this.props.data, "lists", ids);
        // lineups.forEach((l)=>{
        //     //btw: this array is not immutable
        //     //wip
        //     //l.savings = l.relationships.savings.data.map(s=>build(this.props.data, "savings", s.id));
        // });

        if (this.state.filter) {

            let options = {
                keys: ['name'],
                sort: true,
                threshold: 0.6
            };

            let fuse = new Fuse(lineups, options);

            lineups = fuse.search(this.state.filter);

            //TODO : use another lib here
            //lineups = lineups.filter((l) => l.name.indexOf(this.state.filter) >= 0);
        }

        return (
            <View style={{}}>
                <SearchBar
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={"rechercher dans mes listes"}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                />
                <FlatList
                    data={lineups}
                    renderItem={this.renderItem.bind(this)}
                    keyExtractor={(item, index) => item.id}
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
        );
    }

    onSearchInputChange(input) {
        this.setState({filter: input}, () => this.performSearch());
    }


    performSearch() {
        // execute the local search here !

    }

    isSearching() {
        return !!this.state.filter;
    }

    //TODO: extract lineup card style
    renderHeader() {
        if (this.isSearching()) return null;
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
        let lineup = item.item;


        return (
            <TouchableHighlight onPress={() => this.props.onLineupPressed(lineup)}>
                <View>
                    <LineupCell
                        lineup={lineup}
                        onAddInLineupPressed={this.props.onAddInLineupPressed}
                    />
                </View>
            </TouchableHighlight>
        )
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
    },
    searchContainer: {
        backgroundColor: 'white',
        marginTop: 40
    },
    searchInput: {
        backgroundColor: 'white',
    },
});

const mapStateToProps = (state, ownProps) => ({
    lineupList: state.lineupList,
    request: state.request,
    data: state.data,
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