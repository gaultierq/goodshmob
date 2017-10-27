// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from 'react-native';


import {connect} from "react-redux";
import LineupCell from "./components/LineupCell";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import i18n from '../i18n/i18n'
import * as UI from "../screens/UIStyles";
import {SearchBar} from 'react-native-elements'
import Fuse from 'fuse.js'
import type types, {Id, List, User} from "../types";
import ItemCell from "./components/ItemCell";
import Feed from "./components/feed";
import Swipeout from "react-native-swipeout";
import CurrentUser from "../CurrentUser"
import {actions as savingsActions} from "./savings"
import ApiAction from "../utils/ApiAction";
import {buildData, doDataMergeInState} from "../utils/DataUtils";
import {CREATE_LINEUP} from "./actions"
import algoliasearch from 'algoliasearch/reactnative';


type Props = {
    userId: Id,
    onLineupPressed: (lineup: List) => void,
    onSavingPressed: Function,
    onAddInLineupPressed: Function,
    canFilterOverItems: boolean | ()=>boolean,
    data?: any
};

type State = {
    isLoading: boolean,
    isLoadingMore: boolean,
    searchResult: {lists: Array, savings: Array}
};
class LineupListScreen extends Component<Props, State> {

    // props: {
    //     userId: Id,
    //     onLineupPressed: (lineup: List) => void,
    //     onSavingPressed: Function,
    //     onAddInLineupPressed: Function,
    //     canFilterOverItems: boolean | ()=>boolean,
    //     data: Object
    // };
    //
    // state: {
    //     isLoading: boolean,
    //     isLoadingMore: boolean,
    //     searchResult: {lists: Array, savings: Array}
    // };

    state= {
        filter: null,
        isLoading: false,
        isLoadingMore: false,
        searchResult:  {lists: [], savings: []}
    };

    componentWillMount() {
        if (!this.getUser()) {
            this.props.dispatch(actions.getUser(this.props.userId).disptachForAction2(FETCH_USER));
        }
    }

    getUser() {
        return buildData(this.props.data, "users", this.props.userId);
    }

    render() {
        //TODO: when generalized include is working
        // const user = this.getUser();
        // let lineups : Array<types.List> = user ? user.lists || [] : [];

        //let lineups = lineupList.list.map((l) => buildNonNullData(this.props.data, "lists", l.id));
/*
        let lineupList = this.props.lineupList;
        let ids = lineupList.list.asMutable().map(o=>o.id);
        //let lineups : Array<types.List> = build(this.props.data, "lists", ids, {includeType: true});
        let lineups : Array<types.List> = ids.map((id) => ({id, type: "lists"}));
       */
        const {userId} = this.props;

        let user: User = buildData(this.props.data, "users", userId);

        let lists, fetchSrc;
        if (user && user.lists) {
            lists = user.lists;
            fetchSrc = userId === CurrentUser.id ? {
                callFactory: actions.fetchLineups,
                action: FETCH_LINEUPS,
                options: {userId}
            } : null;
        }
        else {
            lists = [];
            fetchSrc = {
                callFactory: actions.getUser,
                action: GET_USER_W_LISTS
            };
        }



        let data: Array<types.List|types.Item>;

        let searchResult = this.state.searchResult;
        let hasSearchResult = searchResult.savings.length > 0 || searchResult.lists.length > 0;

        if (this.state.filter && hasSearchResult) {
            data = [].concat(searchResult.lists, searchResult.savings);
        }
        //deactivate local search until further notice
        // else if (this.state.filter) {
        //     data = this.applyFilter(lineups);
        // }
        else {
            data = lists;
        }

        // let fetchSrc = this.props.userId === CurrentUser.id ? {
        //     callFactory: actions.fetchCall,
        //     action: FETCH_LINEUPS
        // } : null;



        return (
            <View>
                <SearchBar
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t('lineups.search.placeholder')}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                    autoCapitalize='none'
                    autoCorrect={false}
                />
                <Feed
                    data={data}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={fetchSrc}
                    style={{marginBottom: 120, minHeight: 200}} //FIXME: this is a hack.
                />

            </View>
        );
    }

    canFilterOverItems() {
        let cfoi = this.props.canFilterOverItems;
        if (cfoi instanceof Function) return cfoi();
        return cfoi;

    }
    applyFilter(lineups) {
        if (!lineups) return lineups;
        let searchIn = [];

        lineups.forEach((lu: types.List) => {
            searchIn.push(lu);

            if (this.canFilterOverItems()) {
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

        return fuse.search(this.state.filter);
    }

    onSearchInputChange(input) {
        this.setState({filter: input});

        if (input) {
            this.performAlgoliaSearch(input);
        }
        else {
            let lists = [], savings = [];
            this.setState({searchResult: {lists, savings}});
        }
    }

    performAlgoliaSearch(input) {
        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");

        const queries = [{
            indexName: 'List_development',
            query: input,
            params: {
                hitsPerPage: 10,
                filters: 'user_id:' + this.props.userId
            }
        }, {
            indexName: 'Saving_development',
            query: input,
            params: {
                hitsPerPage: 10,
                filters: 'user_id:' + this.props.userId
            }
        }
        ];

        client.search(queries, (err, content) => {

            //FIXME: do not build object here. The main use-case is a result not in the redux store.
            if (err) {
                console.error(err);
                return;
            }
            let lists = content.results[0].hits.map((l) => {
                return (
                    // buildData(this.props.data, "lists", l.objectID) ||
                    {
                        id: l.objectID,
                        name: l.name,
                        user: Object.assign({type: "users"}, l.user, {id: l.user_id}),
                        type: "lists"
                    });
            });

            let savings = content.results[1].hits.map((flat) => {
                return (
                    // buildData(this.props.data, "savings", flat.objectID) ||
                    {
                        id: flat.objectID,
                        name: flat.name,
                        user: Object.assign({type: "users"}, flat.user, {id: flat.user_id}),
                        resource: {type: flat.type, image: flat.image, url: flat.url, title: flat.name},
                        type: "savings"
                    });
            });
            console.log(`search result lists: ${JSON.stringify(lists)}`);
            console.log(`search result savings: ${JSON.stringify(savings)}`);

            this.setState({searchResult: {lists, savings}});
        });
    }

    isSearching() {
        return !!this.state.filter;
    }

    //TODO: extract lineup card style
    renderHeader() {
        if (this.isSearching()) return null;
        return <TouchableHighlight onPress={() => {this.setModalVisible(true)}}>
            <View style={
                [UI.CARD(),{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    marginTop: 10,
                    marginBottom: 10,
                }]
            }>
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

    //render a lineup row
    renderItem({item}) {

        const {userId} = this.props;

        let result;
        let isLineup = item.type === 'lists';

        //item can be from search, and not yet in redux store
        item = buildData(this.props.data, item.type, item.id);

        if (!item) return null;

        if (isLineup) {
            let handler = this.props.onLineupPressed ? () => this.props.onLineupPressed(item) : null;
            result = (
                <TouchableHighlight onPress={handler}>
                    <View>
                        <LineupCell
                            lineup={item}
                            onAddInLineupPressed={this.props.onAddInLineupPressed}
                        />
                    </View>
                </TouchableHighlight>
            )
        }
        else {
            let saving = item;

            let resource = saving.resource;
            //TODO: this is hack
            if (!resource) return null;

            result = (
                <ItemCell
                    item={resource}
                    onPressItem={()=>this.props.onSavingPressed(saving)}
                />
            )
        }

        let disabled = /*item.user.id*/userId !== CurrentUser.id;

        let swipeBtns = [{
            text: 'Delete',
            backgroundColor: 'red',
            underlayColor: 'rgba(0, 0, 0, 1, 0.6)',
            onPress: () => this.props.dispatch((isLineup? actions.deleteLineup : savingsActions.deleteSaving)(item))
        }];

        // return result;
        return (
            <Swipeout right={swipeBtns}
                      autoClose={true}
                      backgroundColor= 'transparent'
                      disabled={disabled}>
                {result}
            </Swipeout>
        )

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'white',
    },
    searchInput: {
        backgroundColor: 'white'

    },
});

const mapStateToProps = (state, ownProps) => ({
    lineupList: state.lineupList,
    request: state.request,
    data: state.data,
});

const GET_USER_W_LISTS = new ApiAction("get_user");
const FETCH_LINEUPS = new ApiAction("fetch_lineups");
const DELETE_LINEUP = new ApiAction("delete_lineup");

const actions = (() => {

    return {
        fetchLineups: () => new Api.Call()
            .withMethod('GET')
            .withRoute("lists")
        ,
        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "lists,lists.*"
                }
            ),
        deleteLineup : (lineup) => {
            let call = new Api.Call()
                .withMethod('DELETE')
                .withRoute(`lists/${lineup.id}`);

            return call.disptachForAction(DELETE_LINEUP);
        },
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        switch (action.type) {
            case FETCH_LINEUPS.success(): {
                let {userId} = action.options;
                let path = `users.${userId}.relationships.lists.data`;
                state = doDataMergeInState(state, path, action.payload.data);
                break;
            }
            case CREATE_LINEUP.success():
                let payload = action.payload;
                let {id, type} = payload.data;
                let newItem = {id, type};

                let current = state.list;
                let list = [current[0], newItem, ...current.slice(1)];


                state = state.merge({list});
                break;
        }

        return state;
    }
})();

let screen = connect(mapStateToProps)(LineupListScreen);

export {reducer, screen};