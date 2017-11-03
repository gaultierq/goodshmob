// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
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
import type types, {Id, Item, List, Saving, User} from "../types";
import ItemCell from "./components/ItemCell";
import Feed from "./components/feed";
import Swipeout from "react-native-swipeout";
import CurrentUser from "../CurrentUser"
import {actions as savingsActions} from "./savings"
import ApiAction from "../utils/ApiAction";
import {buildData, doDataMergeInState} from "../utils/DataUtils";
import {CREATE_LINEUP} from "./actions"
import algoliasearch from 'algoliasearch/reactnative';
import * as Nav from "./Nav";

type Props = {
    userId: Id,
    onLineupPressed: (lineup: List) => void,
    onSavingPressed: Function,
    onAddInLineupPressed: Function,
    canFilterOverItems: boolean | ()=>boolean,
    data?: any,
    onCancel?: ()=>void
};

type State = {
    isLoading: boolean,
    isLoadingMore: boolean,
    filter: string,
    search: { [string]: SearchState}
};

//token -> {data, hasMore, isSearching}
type SearchState = {
    searchState: number, //0,1,2,3
    page: number,
    nbPages: number,
    data: Array<List|Saving>,
    token: string
};

class LineupListScreen extends Component<Props, State> {

    state = {
        filter: null,
        isLoading: false,
        isLoadingMore: false,
        search: {}
    };


    constructor(props){
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }


    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            if (event.id === Nav.CANCEL) {
                this.props.onCancel();
            }
        }
    }

    render() {
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
                callFactory: () => actions.getUser(userId),
                action: GET_USER_W_LISTS
            };
        }

        let data: Array<types.List|types.Item>;
        let search = this.state.search[this.state.filter];

        let searchResult: Array<Item|List> = search ? search.data : null;
        let hasSearchResult = search && search.data && search.data.length > 0;

        let emptySearchResult = false;
        let isSearching = search && search.searchState === 1;

        let isSearchMode = this.isSearchMode();

        if (isSearchMode) {
            // data = [].concat(searchResult.lists, searchResult.savings);
            data = searchResult;
            emptySearchResult = !isSearching && !hasSearchResult;
        }
        else {
            data = lists;
        }

        return (
            <View>
                <SearchBar
                    lightTheme
                    round
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t('lineups.search.placeholder')}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                    autoCapitalize='none'
                    autoCorrect={false}
                />

                {
                    isSearchMode && <FlatList
                        data={searchResult}
                        renderItem={this.renderItem.bind(this)}
                        keyExtractor={(item) => item.id}
                        ListFooterComponent={this.renderSearchFooter.bind(this)}
                    />
                }

                {!isSearchMode && <Feed
                    data={data}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={fetchSrc}
                    //style={{marginBottom: 120, minHeight: 200}} //FIXME: this is a hack.
                />}

                {emptySearchResult && <Text>Pas de résultat</Text>}

            </View>
        );
    }

    isSearchMode() {
        return !!this.state.filter;
    }

    renderSearchFooter() {
        let search = this.state.search[this.state.filter];
        if (!search) return null;
        let nextPage = search.page + 1;

        let hasMore = nextPage < search.nbPages;
        if (!hasMore) return null;
        return <Button title="load more" onPress={()=>{this.performAlgoliaSearch(search.token, nextPage)}}/>;
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

    onSearchInputChange(input:string) {
        this.setState({filter: input});

        if (input) {
            let search = this.state.search[input];
            if (!search) {
                this.performAlgoliaSearch(input);
            }
        }
        else {
            //this.setState({searchResult: []});
        }
    }

    performAlgoliaSearch(token, page: number = 0) {
        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");
        let search = this.state.search[token] || {token, searchState: 1};

        let params = {
            page,
            hitsPerPage: 2,
            facets: "[\"list_name\"]",
            filters: 'user_id:' + this.props.userId,
        };

        if (!this.canFilterOverItems()) {
            params = {...params, "restrictSearchableAttributes": "list_name"};
        }

        const queries = [
            {
                indexName: 'Saving_development',
                query: token,
                params
            }
        ];


        this.setState({search: {...this.state.search, [token]: search}}, ()=> console.log("new search state "+JSON.stringify(this.state)));
        console.log(`algolia: searching ${token}`);
        client.search(queries, (err, content) => {

            //FIXME: do not build object here. The main use-case is a result not in the redux store.
            if (err) {
                console.error(err);
                return;
            }
            let result = content.results[0];
            let hits = result.hits;
            console.log(`search result lists: ${JSON.stringify(content)}`);
            let searchResult = this.createResultFromHit(hits);

            let search: SearchState = this.state.search[token];

            if (!search.data) search.data = [];

            search.data = search.data.concat(searchResult);
            search.searchState = 2;
            search.page = result.page;
            search.nbPages = result.nbPages;

            this.setState({search: {...this.state.search, input: search}});
        });

    }

    createResultFromHit(hits) {
        let searchResult = [];
        let listsById: { [Id]: List } = {};
        hits.forEach((h) => {
            let hR = h["_highlightResult"];
            let matchedListName = hR["list_name"] && hR["list_name"]["matchLevel"] !== 'none';
            let matchedItemTitle = hR["item_title"] && hR["item_title"]["matchLevel"] !== 'none';

            const {
                objectID,
                list_name,
                item_title,
                list_id,
                user_id,
                type,
                image,
                url,
                user
            } = h;

            let saving = {
                id: objectID,
                user: Object.assign({type: "users"}, user, {id: user_id}),
                resource: {type, image, url, title: item_title},
                type: "savings"
            };

            if (matchedListName) {
                let list = listsById[list_id];
                if (!list) {
                    list = {
                        id: list_id,
                        name: list_name,
                        user: Object.assign({type: "users"}, user, {id: user_id}),
                        type: "lists",
                        savings: []
                    };
                    listsById[list_id] = list;

                    //adding to the result for 1st match
                    searchResult.push(list);
                }
                list.savings.push(saving);
            }

            //if matching a list, algolia will also notify us the item_title matching
            if (matchedItemTitle && this.canFilterOverItems()) {
                searchResult.push(saving);
            }
        });
        return searchResult;
    }

    isSearching() {
        return !!this.state.filter;
    }

    //TODO: extract lineup card style
    renderHeader() {
        if (this.isSearching()) return null;
        return <TouchableWithoutFeedback onPress={() => {this.setModalVisible(true)}}>
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
        </TouchableWithoutFeedback>
            ;
    }

    //render a lineup row
    renderItem({item}) {

        const {userId} = this.props;

        let result;
        let isLineup = item.type === 'lists';

        //FIXME: item can be from search, and not yet in redux store
        item = buildData(this.props.data, item.type, item.id) || item;

        //if (!item) return null;

        if (isLineup) {
            let handler = this.props.onLineupPressed ? () => this.props.onLineupPressed(item) : null;
            result = (
                <TouchableWithoutFeedback onPress={handler}>
                    <View>
                        <LineupCell
                            lineup={item}
                            onAddInLineupPressed={this.props.onAddInLineupPressed}
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
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: 'white',
        borderWidth: 0.5,
        // borderRadius: 30,
        // padding: 20,
        borderColor: UI.Colors.grey1
    },
});

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

const GET_USER_W_LISTS = new ApiAction("get_user");
const FETCH_LINEUPS = new ApiAction("fetch_lineups");
const DELETE_LINEUP = new ApiAction("delete_lineup");

const actions = (() => {

    const include = "lists,lists.savings,savings.resource";

    return {
        fetchLineups: () => new Api.Call()
            .withMethod('GET')
            .withRoute("lists")
            .addQuery({include})
        ,

        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({include}),

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