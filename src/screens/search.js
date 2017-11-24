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

import type {i18Key, Item, List, SearchState, SearchToken} from "../types";
import Button from 'apsl-react-native-button'
import * as UI from "./UIStyles";


import * as _ from "lodash";


export type SearchCategoryType = string;

export type SearchCategory = {
    type: SearchCategoryType,
    query: *,
    parseResponse: (hits) => *,
    renderItem: (item: *) => Node,
    tabName: i18Key,
    placeholder: i18Key,
}

export type SearchResult = {
    [SearchCategoryType]: {
        results: Array<*>,
        page: number,
        nbPages: number,
    }
}

export type SearchEngine = {search: (token: SearchToken, category: SearchCategoryType, page: number) => Promise<SearchResult>};

export type Props = {
    onClickClose?: Function,
    categories: Array<SearchCategory>,
    navigator: *,
    searchEngine: SearchEngine
};

export type State = {
    input?: SearchToken,
    routes: Array<*>,
    searches: { [SearchToken]: {[SearchCategoryType]: SearchState}},
    index: number
};


@connect()
export default class SearchScreen extends Component<Props, State> {

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
        this.setState({ index }, () => this.performSearch(this.state.input, 0));
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
                ListFooterComponent={this.renderSearchFooter(forType)}
            />
        );
    }


    renderSearchFooter(search: SearchState) {
        //let search = this.props.search;
        if (!search) return null;
        let nextPage = search.page + 1;

        let hasMore = nextPage < search.nbPages;
        if (!hasMore) return null;

        //TODO: flaw
        let isLoadingMore = /*search.page > 0 && */search.searchState === 1;

        return (<Button
            isLoading={isLoadingMore}
            isDisabled={isLoadingMore}
            onPress={()=>{this.performSearch(search.token, nextPage)}}
            style={[styles.button, {marginTop: 15}]}
            disabledStyle={styles.button}
        >
            <Text style={{color: isLoadingMore ? UI.Colors.grey1 : UI.Colors.black}}>load more</Text>
        </Button>);
    }


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === 'cancel_search') { // this is the same id field from the static navigatorButtons definition
                this.props.onClickClose();
            }
        }
    }

    render() {

        let l = this.props.categories.length;

        return (
            <View style={{width:"100%", height: "100%", backgroundColor: "white"}}>
                <SearchBar
                    autoFocus
                    lightTheme
                    onChangeText={this.onSearchInputChange.bind(this)}
                    placeholder={i18n.t(this.getCurrentCategory().placeholder)}
                    clearIcon={{color: '#86939e'}}
                    containerStyle={styles.searchContainer}
                    inputStyle={styles.searchInput}
                    autoCapitalize='none'
                    autoCorrect={false}
                />


                { l>1 && <TabViewAnimated
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={this.renderHeader.bind(this)}
                    onIndexChange={this.handleIndexChange.bind(this)}
                />}

                {
                    l === 1 && this.renderSearchPage(this.props.categories[0])
                }

            </View>

        );
    }

    onSearchInputChange(input: string) {
        this.setState({input});
        this.performSearch(input, 0);
    }

    // setState(partialState, callback?) {
    //     let t = Math.random();
    //     console.debug(`DEBUG(${t}): partial=${JSON.stringify(partialState)}`);
    //     callback = () => console.log(`DEBUG(${t}): state=${JSON.stringify(this.state)}`);
    //
    //     super.setState(partialState, callback);
    // }

    performSearch(token: SearchToken, page: number) {
        if (!token) return;

        //1. prepare search
        let search = this.state.searches[token];

        if (!search) {
            let categories = this.props.categories;
            categories.reduce((res, c) => {
                res[c.type] = {token};
                return res;
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

        let catType = this.getCurrentCategory().type;

        this.props
            .searchEngine.search(token, catType, page)
            .then((results: SearchResult) => {
            let res =  {};
            this.props.categories.reduce((obj, c, i) => {

                let type = c.type;

                let search /*: SearchState */ = this.state.searches[token][type];

                let result = results[type];

                if (result) {
                    if (!search.data) search.data = [];
                    search.data = search.data.concat(result.results);
                    search.searchState = 2;
                    search.page = result.page;
                    search.nbPages = result.nbPages;

                    obj[type] = search;
                }

                return obj;
            }, res);

            this.setState({searches: {...this.state.searches, [token]: {...res}}});
        });


    }

    getCurrentCategory() {
        return this.props.categories[this.state.index];
    }
}

type PageProps = {
    category: SearchCategory,
    isLoading: () => boolean,
    onItemSelected: Function,
    input: string,
    renderItem: (item: *) => Node,
    search: SearchState,
    ListFooterComponent?: Node
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


        let loadingFirst = isSearchRequesting && search.page === 0;

        return (
            <View style={{flex: 1, width:"100%", height: "100%"}}>
                {
                    loadingFirst && <ActivityIndicator
                        animating={loadingFirst}
                        size="small"
                        style={{margin: 12}}
                    />
                }
                {
                    !emptySearchResult &&
                    <FlatList
                        data={searchResult}
                        renderItem={this.props.renderItem}
                        keyExtractor={(item) => item.id}
                        ListFooterComponent={this.props.ListFooterComponent}
                    />
                }
                {emptySearchResult && <Text style={{alignSelf: "center", marginTop: 20}}>Pas de résultat</Text>}

            </View>

        );
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
        //width: 90,
    },
    label: {
        color: '#000000',
    },
    button: {
        padding: 8,
        height: 30,
        borderColor: "transparent",
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

