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
import type {i18Key, Item, List, SearchState, SearchToken} from "../types";
import {createResultFromHit} from "../utils/AlgoliaUtils";
import Button from 'apsl-react-native-button'
import * as UI from "./UIStyles";
import * as _ from "lodash";

export type SearchCategoryType = string;

export type SearchCategory = {
    type: SearchCategoryType,
    query: *,
    renderItem: (item: *) => Node,
    tabName: i18Key
}

type Props = {
    onClickClose?: Function,
    //renderItem: (item) => Node,
    //queries: Array<*>,
    categories: Array<SearchCategory>,
    placeholder: i18Key,
    navigator: *
};

type State = {
    input?: SearchToken,
    routes: Array<*>,
    searches: { [SearchToken]: {[SearchCategoryType]: SearchState}},
    index: number
};


@connect()
export default class AlgoliaSearchScreen extends Component<Props, State> {

    static navigatorButtons = {
        rightButtons: [
            {
                //icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
                id: 'cancel_search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                title: "Cancel"
            }
        ],
    };

    state : State;

    constructor(props: Props) {
        super(props);
        if (props.onClickClose) {
            props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        }

        this.state = {
            searches: {},
            index: 0,
            routes: props.categories.map((c, i) => ({key: `${i}`, title: i18n.t(c.tabName)})),
        };
    }

    handleIndexChange(index: number) {
        this.setState({ index }, () => this.performAlgoliaSearch(this.state.input));
    }

    renderHeader(props: *) {
        return <TabBar {...props}
                       indicatorStyle={styles.indicator}
                       style={styles.tabbar}
                       tabStyle={styles.tab}
                       labelStyle={styles.label}/>;
    }

    renderScene({ route }: *) {
        return this.renderSearchPage(this.props.categories[route.key])
    };

    renderSearchPage(category: SearchCategory) {
        let forToken = this.state.searches[this.state.input];
        if (!forToken) return null;
        let forType : SearchState = forToken[category.type];

        return (
            <SearchPage
                search={forType}
                renderItem={category.renderItem}
                onItemSelected={this.props.onItemSelected}
            />
        );
    }


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'cancel_search') { // this is the same id field from the static navigatorButtons definition
                this.props.onClickClose();
            }
        }
    }

    render() {

        return (
            <View style={{width:"100%", height: "100%"}}>
                <SearchBar
                    autoFocus
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t(this.props.placeholder)}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                    autoCapitalize='none'
                    autoCorrect={false}
                />
                <TabViewAnimated
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={this.renderHeader.bind(this)}
                    onIndexChange={this.handleIndexChange.bind(this)}
                />

            </View>

        );
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

        //search: {category: searchState}
        let search = this.state.searches[token];

        if (!search) {
            let categories = this.props.categories;
            categories.reduce((res, c) => {
                res[c.type] = {token}
            }, search = {})
        }

        _.forIn(search, (val) => {
            val.page = page;
            val.searchState = 1;
        });

        let partialState = {
            searches: {
                ...this.state.searches,
                [token]: {...search},
            }
        };

        this.setState(partialState);

        //searching
        console.log(`algolia: searching ${token}`);

        const queries = this.props.categories.map(c=>{
            let q = c.query;
            let params = q.params;
            params = {...params, page, hitsPerPage: 2};
            return {...q, params, query: token}
        });
        client.search(queries, (err, content) => {

            //FIXME: do not build object here. The main use-case is a result not in the redux store.
            if (err) {
                console.error(err);
                return;
            }

            let res =  {};
            this.props.categories.reduce((obj, c, i) => {

                let result = content.results[i];
                let hits = result.hits;
                console.log(`search result lists: ${JSON.stringify(content.length)}`);

                let searchResult = createResultFromHit(hits);
                let type = c.type;

                let search: SearchState = this.state.searches[token][type];

                if (!search.data) search.data = [];

                search.data = search.data.concat(searchResult);
                search.searchState = 2;
                search.page = result.page;
                search.nbPages = result.nbPages;

                obj[type] = search;
            }, res);
            //res = {savings: {data...}

            console.log("DEBUG: YOOOOO" + JSON.stringify(res));

            this.setState({searches: {...this.state.searches, [token]: {...res}}});
        });

    }
}

type PageProps = {
    category: SearchCategory,
    isLoading: () => boolean,
    onItemSelected: Function,
    input: string,
    renderItem: (item: *) => Node,
    search: SearchState
};

type PageState = {
    //searches: { [SearchToken]: SearchState},
};


class SearchPage extends Component<PageProps, PageState> {


    state : PageState = {
    };

    render() {
        let search = this.props.search;

        let searchResult: Array<Item|List> = (search && search.data) || [];
        let hasSearchResult = search && search.data && search.data.length > 0;

        let isSearchRequesting = search && search.searchState === 1;

        let emptySearchResult = search && !isSearchRequesting && !hasSearchResult;

        console.debug("DEBUG: search render:" + searchResult.length);

        return (
            <View style={{width:"100%", height: "100%"}}>
                {
                    !emptySearchResult &&
                    <FlatList
                        data={searchResult}
                        renderItem={this.props.renderItem}
                        keyExtractor={(item) => item.id}
                        ListFooterComponent={this.renderSearchFooter.bind(this)}
                    />


                }
                {emptySearchResult && <Text style={{alignSelf: "center", marginTop: 20}}>Pas de résultat</Text>}

            </View>

        );
    }

    renderSearchFooter() {
        return null;
        // let search = this.props.search;
        // if (!search) return null;
        // let nextPage = search.page + 1;
        //
        // let hasMore = nextPage < search.nbPages;
        // if (!hasMore) return null;
        //
        // //TODO: flaw
        // let isLoadingMore = /*search.page > 0 && */search.searchState === 1;
        //
        // return (<Button
        //     isLoading={isLoadingMore}
        //     isDisabled={isLoadingMore}
        //     onPress={()=>{this.performAlgoliaSearch(search.token, nextPage)}}
        //     style={[styles.button, {marginTop: 15}]}
        //     disabledStyle={styles.disabledButton}
        // >
        //     <Text style={{color: isLoadingMore ? UI.Colors.grey1 : UI.Colors.black}}>load more</Text>
        // </Button>);
    }

    // setState(partialState, callback?) {
    //     let t = Math.random();
    //     console.debug(`DEBUG(${t}): partial=${JSON.stringify(partialState)}`);
    //     callback = () => console.log(`DEBUG(${t}): state=${JSON.stringify(this.state)}`);
    //
    //     super.setState(partialState, callback);
    // }
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
        //width: 90,
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

    //copied: rm useless
    searchContainer: {
        backgroundColor: 'white',
    },
    searchInput: {
        backgroundColor: 'white',
    },
    tabbar: {
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
        //width: 90,
    },
    label: {
        color: '#000000',
    },
});

