// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import {TabBar, TabViewAnimated, TabViewPagerPan} from 'react-native-tab-view';

import {SearchBar} from 'react-native-elements'

import type {i18Key, List, Saving, SearchToken} from "../../types";
import Button from 'apsl-react-native-button'
import * as UI from "../UIStyles";
import {NavStyles} from "../UIStyles";
import {Navigation} from 'react-native-navigation';
import update from "immutability-helper";
import {Colors} from "../colors";
import {DEEPLINK_SEARCH_CLOSE, DEEPLINK_SEARCH_SUBMITED, DEEPLINK_SEARCH_TEXT_CHANGED} from "./SearchNavBar";
import SearchPage from "./SearchPage";

export type SearchCategoryType = string;

export type SearchCategory = {
    type: SearchCategoryType,
    query: *,
    parseResponse: (hits: []) => *,
    renderItem: (item: *) => Node,
    tabName: i18Key,
    placeholder: i18Key,
    searchOptions: SearchOptions
}

export type SearchResult = {
    [SearchCategoryType]: {
        results: Array<*>,
        page: number,
        nbPages: number,
    }
}
export type SearchOptions = {
    renderOptions: (any, any => void, void => void) => Node
}

export type SearchEngine = {
    search:
        (
            token: SearchToken,
            category: SearchCategoryType,
            page: number,
            searchOptions: ?any

        ) => Promise<SearchResult>,
    canSearch: (
        token: SearchToken,
        category: SearchCategoryType,
        searchOptions: ?any) => boolean

};

export type Props = {
    categories: Array<SearchCategory>,
    navigator: *,
    searchEngine: SearchEngine,
    token?: ?SearchToken,
    style?: ? *

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

    state : State;

    searchOptions: { [SearchCategoryType]: *} = {};

    constructor(props: Props) {
        super(props);

        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        this.state = {
            input: '',
            searches: {},
            index: 0,
            routes: props.categories.map((c, i) => ({key: `${i}`, title: c.tabName ? i18n.t(c.tabName) : null})),
        };

        props.navigator.setStyle({...UI.NavStyles,
            navBarCustomView: 'goodsh.SearchNavBar',
            navBarCustomViewInitialProps: {initialInput: props.token, placeholder: props.placeholder}
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
        console.log(`tab changed to ${index}`);
        this.setState({index}, () => this.performSearch(this.state.input, 0));
    }

    _renderPager = props => <TabViewPagerPan {...props} />;


    render() {

        let nCat = this.props.categories.length;
        let hasSearched = !_.isEmpty(this.state.searches);

        let cat = this.getCurrentCategory();

        const showTabs = nCat > 1 && (hasSearched || true);

        const onNewOptions = newOptions => {
            this.searchOptions[cat.type] = newOptions;
            this._debounceSearch();
        };

        return (
            <KeyboardAvoidingView behavior={ (Platform.OS === 'ios') ? 'padding' : null }
                                  keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
                                  style={[{width:"100%", height: "100%", backgroundColor: "transparent"},this.props.style]}>

                {
                    cat && cat.searchOptions && (
                        cat.searchOptions.renderOptions(
                            this.getCurrentSearchOptions(cat.type),
                            onNewOptions,
                            this._debounceSearch
                            )
                    )
                }

                { showTabs && <TabViewAnimated
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={this.renderHeader.bind(this)}
                    onIndexChange={this.handleIndexChange.bind(this)}
                    keyboardShouldPersistTaps='always'
                    renderPager={this._renderPager}
                />}

                {
                    nCat === 1 && this.renderSearchPage(this.props.categories[0])
                }

            </KeyboardAvoidingView>

        );
    }

    getCurrentSearchOptions(catType: SearchCategoryType) {
        return this.searchOptions[catType];
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
        let forType : SearchState = forToken && forToken[category.type];

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
            <Text style={{color: isLoadingMore ? Colors.greyishBrown : Colors.black}}>{i18n.t('actions.load_more')}</Text>
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

    _debounceSearch = _.debounce(() => this.performSearch(this.state.input, 0), 500);

    onSearchInputChange(input: string) {
        //this.setState({input});
        this.setState({input}, input => this._debounceSearch(input));
    }


    performSearch(token: SearchToken, page: number) {

        let catType = this.getCurrentCategory().type;

        console.log(`performSearch:token=${token} page=${page}`);
        const {search, canSearch} = this.props.searchEngine;
        const options = this.getCurrentSearchOptions(catType);


        if (!canSearch(token, catType, options)) {
            console.log(`perform search aborted: cannot search`);
            return;
        }

        // let lastPage = _.get(this.state.searches, `${token}.${catType}.page`, -1);
        // if (lastPage >= page) {
        //     console.log(`perform search aborted: lastPage>=page : ${lastPage} >= ${page}`);
        //     return;
        // }

        //set searching
        const debugState = {
            searches: {
                ...this.state.searches,
                [token]: {
                    ..._.get(this.state, `searches.${token}`, null),
                    [catType]: {
                        ..._.get(this.state, `searches.${token}.${catType}`, null),
                        page, searchState: 1, token
                    }
                }
            },
        };
        this.setState(debugState, () => {
            console.log(`index set within perform search=${this.state.index}`);
        });



        search(token, catType, page, options)
            .catch(err=> {
                console.warn(`error while performing search:`, err);
                this.setState(update(this.state, {searches: {[token]: {[catType]: {$merge: {searchState: 3}}}}},));
            })
            .then((results: SearchResult) => {

                //const catType = this.getCurrentCategory().type;
                if (!results) {
                    // TODO: set state error
                    return;
                }

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
                    this.setState(newState, () => {
                        console.log(`index (2) set within perform search=${this.state.index}`);
                    });
                }
            });
    }

    getCurrentCategory() {
        return this.props.categories[this.state.index];
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
        // backgroundColor: Colors.white,
        backgroundColor: NavStyles.navBarBackgroundColor,
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

