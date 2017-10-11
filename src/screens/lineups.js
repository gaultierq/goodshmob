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
import build from 'redux-object'
import Fuse from 'fuse.js'
import type * as types from "../types";
import ItemCell from "./components/ItemCell";
import Feed from "./components/feed";
import Swipeout from "react-native-swipeout";
import CurrentUser from  "../CurrentUser"
import {actions as savingsActions} from "./savings"

class LineupListScreen extends Component {

    props: {
        onLineupPressed: Function,
        onAddInLineupPressed: Function,
        canFilterOverItems: Function,
        data: Object
    };

    state: {
        isLoading: boolean,
        isLoadingMore: boolean,
    };

    constructor(){
        super();
        this.state= {
            isCreatingLineup: false,
            modalVisible: false,
            filter: null,
            isLoading: false,
            isLoadingMore: false,
        }
    }

    componentDidMount() {
        this.load();
    }

    load() {
        if (this.state.isLoading) return;
        this.setState({isLoading: true});
        this.props
            .dispatch(actions.loadLineups())
            .then(() => {
                this.setState({isLoading: false});
            });
    }

    loadMore() {
        if (this.state.isLoadingMore) return;
        if (!this.props.lineupList.links) return;

        let nextUrl = this.props.lineupList.links.next;
        console.log("Next url:" + nextUrl);

        this.setState({isLoadingMore: true});
        //data.meta;
        this.props.dispatch(actions.loadMoreLineups(nextUrl))
            .then(() => {
                this.setState({isLoadingMore: false});
            });
    }

    render() {
        let lineupList = this.props.lineupList;
        //let lineups = lineupList.list.map((l) => buildNonNullData(this.props.data, "lists", l.id));
        let ids = lineupList.list.asMutable().map(o=>o.id);
        let lineups : Array<types.List> = build(this.props.data, "lists", ids, {includeType: true});

        let data: Array<types.List|types.Item>;

        if (this.state.filter) {

            let searchIn = [];

            lineups.forEach((lu: types.List) => {
                searchIn.push(lu);

                if (this.props.canFilterOverItems()) {
                    // searchIn = searchIn.concat(lu.savings.map((sa: types.Saving)=>sa.resource))
                    searchIn = searchIn.concat(lu.savings)
                }
            });

            let fuse = new Fuse(searchIn, {
                keys: [{
                    name: 'name',
                    weight: 0.6
                }, {
                    name: 'resource.title',
                    weight: 0.4
                }],
                // keys: ['name', 'title'],
                sort: true,
                threshold: 0.6
            });

            data = fuse.search(this.state.filter);

        }
        else {
            data = lineups;
        }

        return (
            <View style={{}}>
                <SearchBar
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t('lineups.search.placeholder')}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                />
                <Feed
                    data={data}
                    renderItem={this.renderItem.bind(this)}
                    fetchAction={actions.loadLineups}
                    fetchMoreAction={actions.loadMoreLineups}
                    ListHeaderComponent={this.renderHeader()}
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
        return this.state.isLoadingMore;
    }

    isLoading() {
        return this.state.isLoading;
    }

    //render a lineup row
    renderItem(item) {
        let it = item.item;

        let result;
        let isLineup = it.type === 'lists';

        if (isLineup) {
            result = (
                <TouchableHighlight onPress={() => this.props.onLineupPressed(it)}>
                    <View>
                        <LineupCell
                            lineup={it}
                            onAddInLineupPressed={this.props.onAddInLineupPressed}
                        />
                    </View>
                </TouchableHighlight>
            )
        }
        else {
            let saving = it;
            result = (
                <ItemCell
                    item={saving.resource}
                    onPressItem={() => {}}
                />
            )
        }

        let disabled = it.user.id !== CurrentUser.id;

        let swipeBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
            onPress: () => this.props.dispatch((isLineup? actions.deleteLineup : savingsActions.deleteSaving)(it))
        }];

        // return result;
        return (
            <Swipeout right={swipeBtns}
                      autoClose='true'
                      backgroundColor= 'transparent'
                      disabled={disabled}>
                {result}
            </Swipeout>
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
        //marginTop: 40
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
    const DELETE_LINEUP = new Api.ApiAction("delete_lineup");

    return {FETCH_LINEUPS, FETCH_MORE_LINEUPS, CREATE_LINEUP, DELETE_LINEUP};
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

            return call.disptachForAction2(actiontypes.FETCH_LINEUPS);
        },

        loadMoreLineups:(nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction2(actiontypes.FETCH_MORE_LINEUPS);
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
        deleteLineup : (lineup) => {
            let call = new Api.Call()
                .withMethod('DELETE')
                .withRoute(`lists/${lineup.id}`);

            return call.disptachForAction(actiontypes.DELETE_LINEUP);
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