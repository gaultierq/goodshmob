// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {connect} from "react-redux";
import {combineReducers} from "redux";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import i18n from '../i18n/i18n'
import {SearchBar} from 'react-native-elements'
import * as UIStyles from "../screens/UIStyles"
import algoliasearch from 'algoliasearch/reactnative';
import type {Item, List, SearchState, SearchToken} from "../types";
import {createResultFromHit} from "../utils/AlgoliaUtils";
import Button from 'apsl-react-native-button'
import * as UI from "./UIStyles";

type Props = {
    onClickClose: Function,
    renderItem: (item) => Node,
    queries: Array<*>
};

type State = {
    input?: SearchToken,
    searches: { [SearchToken]: SearchState},
};

@connect()
export default class NetworkSearchScreen extends Component<Props, State> {

    static navigatorButtons = {
        rightButtons: [
            {
                //icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
                id: 'cancel_search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                title: "Cancel"
            }
        ],
    };

    state : State = {
        searches: {}
    };

    constructor(props) {
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'cancel_search') { // this is the same id field from the static navigatorButtons definition
                this.props.onClickClose();
            }
        }
    }


    isSearching() {
        let {input, searches} = this.state;
        return input && searches[input] && searches[input].searchState === 1;
    }

    render() {
        let search = this.getSearchObj();

        let searchResult: Array<Item|List> = (search && search.data) || [];
        let hasSearchResult = search && search.data && search.data.length > 0;

        let isSearching = search && search.searchState === 1;

        let emptySearchResult = !isSearching && !hasSearchResult;

        console.debug("DEBUG: search render:" + searchResult.length);

        return (
            <View style={{width:"100%", height: "100%"}}>
                <SearchBar
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t('search_item_screen.placeholder.lol')}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoFocus
                />

                <FlatList
                    data={searchResult}
                    renderItem={this.props.renderItem.bind(this)}
                    keyExtractor={(item) => item.id}
                    ListFooterComponent={this.renderSearchFooter.bind(this)}
                />

                {emptySearchResult && <Text>Pas de résultat</Text>}

            </View>

        );
    }

    renderSearchFooter() {
        let search = this.getSearchObj();
        if (!search) return null;
        let nextPage = search.page + 1;

        let hasMore = nextPage < search.nbPages;
        if (!hasMore) return null;

        //TODO: flaw
        let isLoadingMore = /*search.page > 0 && */search.searchState === 1;

        return (<Button
            isLoading={isLoadingMore}
            isDisabled={isLoadingMore}
            onPress={()=>{this.performAlgoliaSearch(search.token, nextPage)}}
            style={[styles.button, {marginTop: 15}]}
            disabledStyle={styles.disabledButton}
        >
            <Text style={{color: isLoadingMore ? UI.Colors.grey1 : UI.Colors.black}}>load more</Text>
        </Button>);
    }



    getSearchObj(): SearchState {
        return this.state.input ? this.state.searches[this.state.input] : null;
    }

    onSearchInputChange(input) {
        this.setState({input});
        this.performAlgoliaSearch(input);
    }

    setState(partialState, callback?) {
        let t = Math.random();
        console.debug(`DEBUG(${t}): partial=${JSON.stringify(partialState)}`);
        callback = () => console.log(`DEBUG(${t}): state=${JSON.stringify(this.state)}`);

        super.setState(partialState, callback);
    }

    performAlgoliaSearch(token: SearchToken, page: number = 0) {
        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");
        let search = this.state.searches[token] || {token};


        const queries = this.props.queries.map(q=>{
            let params = q.params;
            params = {...params, page, hitsPerPage: 2};
            return {...q, params, query: token}
        });

        console.info("algolia search:" + JSON.stringify(queries));

        this.setState({searches: {...this.state.searches, [token]: {...search, searchState: 1}, page}});

        console.log(`algolia: searching ${token}`);
        client.search(queries, (err, content) => {

            //FIXME: do not build object here. The main use-case is a result not in the redux store.
            if (err) {
                console.error(err);
                return;
            }
            let result = content.results[0];
            let hits = result.hits;
            console.log(`search result lists: ${JSON.stringify(content.length)}`);
            let searchResult = createResultFromHit(hits);

            let search: SearchState = this.state.searches[token];

            if (!search.data) search.data = [];

            search.data = search.data.concat(searchResult);
            search.searchState = 2;
            search.page = result.page;
            search.nbPages = result.nbPages;

            this.setState({searches: {...this.state.searches, input: search}});
        });

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
        backgroundColor: 'white',
    },
    indicator: {
        backgroundColor: UIStyles.Colors.green,
    },
    activityIndicator: {
        position: "absolute",
        top: 30, left: 0, right: 0, justifyContent: 'center',
        zIndex: 3000
    },
    tab: {
        opacity: 1,
        width: 90,
    },
    label: {
        color: '#000000',
    },
    button: {
        padding: 8,
        height: 30,
        // color: UI.Colors.white,
        // borderColor: UI.Colors.white,
    },
    disabledButton: {
        borderColor: UI.Colors.grey1,
    },
});

