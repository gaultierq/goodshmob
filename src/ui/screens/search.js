// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import {TabBar, TabViewAnimated} from 'react-native-tab-view';

import {SearchBar} from 'react-native-elements'

import type {i18Key, Item, List, Saving, SearchToken} from "../../types";
import Button from 'apsl-react-native-button'
import * as UI from "../UIStyles";
import {NavStyles} from "../UIStyles";
import {Navigation} from 'react-native-navigation';
import update from "immutability-helper";
import {Colors} from "../colors";

export type SearchCategoryType = string;

export type SearchCategory = {
    type: SearchCategoryType,
    query: *,
    parseResponse: (hits: []) => *,
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
    categories: Array<SearchCategory>,
    navigator: *,
    searchEngine: SearchEngine,
    token?: ?SearchToken
};


//token -> {data, hasMore, isSearching}
export type SearchState = {
    searchState: number, //0,1,2,3
    page: number,
    nbPages: number,
    data: Array<List|Saving>,
    token: string
};


export type State = {
    input?: SearchToken,
    routes: Array<*>,
    searches: { [SearchToken]: {[SearchCategoryType]: SearchState}},
    index: number
};


@connect()
@logged
export default class SearchScreen extends Component<Props, State> {

    // static navigatorButtons = {
    //     rightButtons: [
    //         {
    //             //icon: require('../../img/drawer_line_up.png'), // for icon button, provide the local image asset name
    //             id: 'cancel_search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
    //             title: "Cancel"
    //         }
    //     ],
    // };


    state : State;

    constructor(props: Props) {
        super(props);

        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        this.state = {
            searches: {},
            index: 0,
            routes: props.categories.map((c, i) => ({key: `${i}`, title: i18n.t(c.tabName)})),
        };

        props.navigator.setStyle({...UI.NavStyles,
            navBarCustomView: 'goodsh.SearchNavBar',
            navBarCustomViewInitialProps: {initialInput: props.token}
        });

        if (props.token) {
            const token = props.token;
            //weak
            this.state.input = token;
            setTimeout(()=> {
                this.performSearch(token, 0);
            });
        }
    }

    handleIndexChange(index: number) {
        console.log('tab changed to' + index);
        this.setState({index}, () => this.performSearch(this.state.input, 0));
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
            <Text style={{color: isLoadingMore ? Colors.greyishBrown : Colors.black}}>load more</Text>
        </Button>);
    }


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together

        //HACK
        if (event.type === 'DeepLink') {
            const payload = event.payload; // (optional) The payload

            switch (event.link) {
                case DEEPLINK_SEARCH_TEXT_CHANGED:
                    this.onSearchInputChange(payload);
                    break;
                case DEEPLINK_SEARCH_SUBMITED:
                    this.performSearch(this.state.input, 0);
                    break;
                case DEEPLINK_SEARCH_CLOSE:
                    // this.setState({isSearching: false});
                    break;
            }
        }
    }

    render() {

        let nCat = this.props.categories.length;
        let hasSearched = !_.isEmpty(this.state.searches);

        const showTabs = nCat > 1 && (hasSearched || true);
        return (
            <View style={{width:"100%", height: "100%", backgroundColor: "transparent"}}>


                { showTabs && <TabViewAnimated
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={this.renderHeader.bind(this)}
                    onIndexChange={this.handleIndexChange.bind(this)}
                />}

                {
                    nCat === 1 && this.renderSearchPage(this.props.categories[0])
                }

            </View>

        );
    }

    onSearchInputChange(input: string) {
        //this.setState({input});
        this.setState({input}, () => this.performSearch(input, 0));
    }


    //searches: { [SearchToken]: {[SearchCategoryType]: SearchState}},

    // export type SearchState = {
    //     searchState: number, //0,1,2,3
    //     page: number,
    //     nbPages: number,
    //     data: Array<List|Saving>,
    //     token: string
    // };

    performSearch(token: SearchToken, page: number) {

        let catType = this.getCurrentCategory().type;

        console.log(`performSearch:token=${token} page=${page}`);

        if (!token) {
            console.log(`perform search aborted: no token to search`);
            return;
        }

        let lastPage = _.get(this.state.searches, `${token}.${catType}.page`, -1);

        if (lastPage >= page) {
            console.log(`perform search aborted: lastPage>=page : ${lastPage} >= ${page}`);
            return;
        }

        //set searching
        this.setState({
            searches: {
                ...this.state.searches,
                [token]: {
                    ..._.get(this.state, `searches.${token}`, null),
                    [catType]: {
                        ..._.get(this.state, `searches.${token}.${catType}`, null),
                        page, searchState: 1, token
                    }
                }
            }
        });

        this.props
            .searchEngine.search(token, catType, page)
            .then((results: SearchResult) => {

                const catType = this.getCurrentCategory().type;
                let result = results[catType];
                if (result) {
                    let {page, nbPages} = result;
                    let newItems = result.results;
                    let searchState = 2;
                    let merge = {page, nbPages, searchState};

                    if (!page) merge = {...merge, data: []};
                    let newState = this.state;
                    newState = update(newState, {searches: {[token]: {[catType]: {$merge: merge}}}},);
                    newState = update(newState, {searches: {[token]: {[catType]: {data: {$push: newItems}}}}});
                    this.setState(newState);
                }
                //
                // let res =  {};
                // this.props.categories.reduce((obj, c, i) => {
                //
                //     let type = c.type;
                //
                //     let search /*: SearchState */ = this.state.searches[token][type];
                //
                //     let result = results[type];
                //
                //     if (result) {
                //         if (!search.data) search.data = [];
                //         search.data = search.data.concat(result.results);
                //         search.searchState = 2;
                //         search.page = result.page;
                //         search.nbPages = result.nbPages;
                //
                //         obj[type] = search;
                //     }
                //
                //     return obj;
                // }, res);
                //
                // this.setState({searches: {...this.state.searches, [token]: {...res}}});
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
            <View style={{flex: 1, width:"100%", height: "100%", backgroundColor: Colors.white}}>
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


type NavProps = {
    onChangeText: (token: string) => void,
    initialInput?: ?SearchToken,
    navigator: any
};

type NavState = {
    input:? string,
};

const DEEPLINK_SEARCH_TEXT_CHANGED = 'DEEPLINK_SEARCH_TEXT_CHANGED';
const DEEPLINK_SEARCH_SUBMITED = 'DEEPLINK_SEARCH_SUBMITED';
const DEEPLINK_SEARCH_CLOSE = 'DEEPLINK_SEARCH_CLOSE';

//connect -> redux
export class SearchNavBar extends Component<NavProps, NavState> {

    state = {input: null};



    static _styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        //copied: rm useless
        searchContainer: {
            backgroundColor: NavStyles.navBarBackgroundColor,
            borderTopColor: 'transparent',
        },
        searchInput: {
            backgroundColor: NavStyles.navBarBackgroundColor,
        },
    });

    constructor(props) {
        super(props);
        this.state = {input: props.initialInput}
    }


    render() {

        return (
            <SearchBar
                autoFocus
                lightTheme
                onChangeText={this.onChangeText.bind(this)}
                onSubmitEditing={this.submit.bind(this)}
                onClearText={this.onClearText.bind(this)}
                placeholder={i18n.t('search')}
                clearIcon={!!this.state.input && {color: '#86939e'}}
                containerStyle={SearchNavBar._styles.searchContainer}
                inputStyle={SearchNavBar._styles.searchInput}
                autoCapitalize='none'
                autoCorrect={false}
                returnKeyType={'search'}
                value={this.state.input}
            />
        );

    }

    submit() {
        Navigation.handleDeepLink({
            link: DEEPLINK_SEARCH_SUBMITED,
        });
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
    indicator: {
        backgroundColor: Colors.green,
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

    searchInput: {
        backgroundColor: Colors.white,
    },
    tabbar: {
        backgroundColor: Colors.white,
    },
    indicator: {
        backgroundColor: Colors.green,
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
