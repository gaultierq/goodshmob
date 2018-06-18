// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {TabBar, TabViewAnimated, TabViewPagerPan} from 'react-native-tab-view'

import type {SearchToken} from "../../types"
import Button from 'apsl-react-native-button'
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR, TAB_BAR_PROPS} from "../UIStyles"
import {Navigation} from 'react-native-navigation'
import update from "immutability-helper"
import {Colors} from "../colors"
import GSearchBar2 from "../components/GSearchBar2"
import type {
    SearchCategory,
    SearchCategoryType,
    SearchEngine,
    SearchQuery,
    SearchResult,
    SearchState,
    SearchTrigger
} from "../../helpers/SearchHelper"


//token -> {data, hasMore, isSearching}

//search query KEY: token x category x options
//options: page x location? x
export type State = {
    input?: SearchToken,
    routes: Array<*>,
    searches: { [SearchToken]: {[SearchCategoryType]: SearchState}},
    index: number
};


export type Props = {
    categories: Array<SearchCategory>,
    navigator: *,
    searchEngine: SearchEngine,
    token?:SearchToken,
    style?: *,
    index: number,
};

@connect()
@logged
export default class SearchScreen extends Component<Props, State> {

    state : State;

    searchOptions: { [SearchCategoryType]: *} = {};

    static defaultProps = {index: 0, autoSearch: true};

    constructor(props: Props) {
        super(props);

        this.state = {
            input: props.token,
            searches: {},
            index: props.index,
            routes: props.categories.map((c, i) => ({key: `${i}`, title: c.tabName})),
        };

        if (props.token) {
            const token = props.token;
            //weak
            this.state.input = token

            setTimeout(()=> {
                this.tryPerformSearch(token, 0);
            });
        }
        this.props.navigator.setTitle({title: i18n.t("search_screen.title")})
    }

    handleIndexChange(index: number) {
        console.log(`tab changed to ${index}`);
        this.setState({index}, () => this.tryPerformSearch(this.state.input, 0));
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
                    <GSearchBar2
                        onChangeText={input => this.setState({input}, input => this._debounceSearch(input))}
                        onSubmitEditing={() => this.tryPerformSearch(this.state.input, 0)}
                        placeholder={this.props.placeholder}
                        value={this.state.input}
                        autoFocus
                        style={{
                            paddingTop: 10,
                            paddingBottom: 5,
                            paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR}}
                    />
                }

                {
                    cat && cat.searchOptions && (
                        cat.searchOptions.renderOptions(
                            this.getSearchOptions(cat.type),
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

    getSearchOptions(catType: SearchCategoryType) {
        return this.searchOptions[catType];
    }

    renderHeader(props: *) {
        return <TabBar {...TAB_BAR_PROPS} {...props}/>
    }

    renderScene({ route }: *) {
        return this.renderSearchPage(this.props.categories[route.key])
    };

    renderSearchPage(category: SearchCategory) {
        let forToken = this.state.searches[this.state.input];
        const categoryType = category.type;
        let results : SearchState = forToken && forToken[categoryType];
        let query: SearchQuery = {
            token: this.state.input,
            categoryType,
            options: this.getSearchOptions(categoryType)
        }

        //FIXME: restore loadmore
        return category.renderResults({query, results})
    }


    //FIXME: restore
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
            onPress={()=>{this.tryPerformSearch(search.token, nextPage)}}
            style={[styles.button, {marginTop: 15}]}
            disabledStyle={styles.button}
        >
            <Text style={{color: isLoadingMore ? Colors.greyishBrown : Colors.black}}>{i18n.t('actions.load_more')}</Text>
        </Button>);
    }


    _debounceSearch = _.debounce(() => this.tryPerformSearch(this.state.input, 0), 500);

    tryPerformSearch(token: SearchToken, page: number, trigger: SearchTrigger = 'unknown') {

        let catType = this.getCurrentCategory().type;

        console.log(`performSearch:token=${token} page=${page}`);
        const {search, canSearch} = this.props.searchEngine;
        const options = this.getSearchOptions(catType);


        if (!canSearch(token, catType, trigger, options)) {
            console.log(`perform search aborted: cannot search`);
            return;
        }

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
                console.debug('search results', results)
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
    button: {
        padding: 8,
        height: 30,
        borderColor: "transparent",
    },

    searchInput: {
        backgroundColor: Colors.white,
    },
    activityIndicator: {
        position: "absolute",
        top: 30, left: 0, right: 0, justifyContent: 'center',
        zIndex: 3000
    },
});

