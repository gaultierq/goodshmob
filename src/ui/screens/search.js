// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, Platform, TouchableOpacity, View, KeyboardAvoidingView} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import {TabBar, TabViewAnimated, TabViewPagerPan} from 'react-native-tab-view';

import {SearchBar} from 'react-native-elements'

import type {i18Key, Item, List, Saving, SearchToken} from "../../types";
import Button from 'apsl-react-native-button'
import * as UI from "../UIStyles";
import {NavStyles} from "../UIStyles";
import {Navigation} from 'react-native-navigation';
import update from "immutability-helper";
import {Colors} from "../colors";
import Spinner from 'react-native-spinkit';
import {SEARCH_STYLES} from "../UIStyles";

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

        ) => Promise<SearchResult>
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
            searches: {},
            index: 1,
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
        return (
            <KeyboardAvoidingView behavior={ (Platform.OS === 'ios') ? 'padding' : null }
                                  keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
                                  style={[{width:"100%", height: "100%", backgroundColor: "transparent"},this.props.style]}>

                {
                    cat && cat.searchOptions && (
                        cat.searchOptions.renderOptions(
                            this.getCurrentSearchOptions(cat.type),
                            newOptions => {
                                this.searchOptions[cat.type] = newOptions;
                                this._debounceSearch();
                            },
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

        if (!token) {
            console.log(`perform search aborted: no token to search`);
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

        this.props
            .searchEngine.search(token, catType, page, this.getCurrentSearchOptions(catType))
            .catch(err=> {
                console.warn(`error while performing search: ${err}`);
                this.setState(update(this.state, {searches: {[token]: {[catType]: {$merge: {searchState: 3}}}}},));
            })
            .then((results: SearchResult) => {

                //const catType = this.getCurrentCategory().type;
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
            <View style={{flex: 1, width:"100%", height: "100%",}}>
                {
                    loadingFirst && (
                        <View style={{
                            flex:1,
                            width: "100%",
                            height: "100%",
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            zIndex: 1000
                        }}>
                            <Spinner
                                isVisible={true}
                                size={__DEVICE_WIDTH__ / 5}
                                type={"WanderingCubes"}
                                color={Colors.greying}/>
                        </View>
                    )
                }
                {
                    !emptySearchResult &&
                    <FlatList
                        data={searchResult}
                        renderItem={this.props.renderItem}
                        keyExtractor={(item) => item.id}
                        ListFooterComponent={this.props.ListFooterComponent}
                        keyboardShouldPersistTaps='always'
                    />
                }
                {emptySearchResult && <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t('lineups.search.empty')}</Text>}

            </View>

        );
    }
}


type NavProps = {
    onChangeText: (token: string) => void,
    initialInput?: ?SearchToken,
    placeholder?: string,
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

    state = {
        input: null,
        placeholder: 'what ?'
    };

    constructor(props) {
        super(props);
        this.state = {input: props.initialInput, placeholder: props.placeholder}
    }


    render() {

        return (
            <SearchBar
                autoFocus
                lightTheme
                onChangeText={this.onChangeText.bind(this)}
                onSubmitEditing={this.submit.bind(this)}
                onClearText={this.onClearText.bind(this)}
                placeholder={this.state.placeholder}
                clearIcon={!!this.state.input && {color: '#86939e'}}
                containerStyle={SEARCH_STYLES.searchContainer}
                inputStyle={SEARCH_STYLES.searchInput}
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
