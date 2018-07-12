// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {PagerPan, TabBar, TabView} from 'react-native-tab-view'

import type {RNNNavigator, SearchToken} from "../../types"
import {SearchKey} from "../../types"
import Button from 'apsl-react-native-button'
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR, TAB_BAR_PROPS} from "../UIStyles"
import {Navigation} from 'react-native-navigation'
import {Colors} from "../colors"
import GSearchBar2 from "../components/GSearchBar2"

import type {
    SearchCategory,
    SearchCategoryType,
    SearchEngine,
    SearchOptions,
    SearchResult,
    SearchState,
} from "../../helpers/SearchHelper"
import {FullScreenLoader} from "../UIComponents"


//token -> {data, hasMore, isSearching}

//search query KEY: token x category x options
//options: page x location? x
export type State = {
    input?: SearchToken,
    routes: Array<*>,
    searches: { [SearchKey]: SearchState},
    searchKey: string,
    index: number
};


export type Props = {
    categories: Array<SearchCategory>,
    navigator: RNNNavigator,
    searchEngine: SearchEngine,
    token?:SearchToken,
    style?: *,
    index: number,
    hideSearchBar?: boolean
};

@connect()
@logged
export default class SearchScreen extends Component<Props, State> {

    state : State;

    searchOptions: { [SearchCategoryType]: SearchOptions} = {};

    static defaultProps = {index: 0, autoSearch: true, hideSearchBar: false};

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
                this.tryPerformSearch(0);
            });
        }
        this.props.navigator.setTitle({title: i18n.t("search_screen.title")})
    }

    handleIndexChange(index: number) {
        console.log(`tab changed to ${index}`);
        this.setState({index}, () => this.tryPerformSearch(0));
    }

    onNewOptions(newOptions: SearchOptions, cat) {
        this.searchOptions[cat.type] = newOptions;
        this._debounceSearch();
    };

    render() {

        let nCat = this.props.categories.length;
        let hasSearched = !_.isEmpty(this.state.searches);

        let cat = this.getCurrentCategory();

        const showTabs = nCat > 1 && (hasSearched || true);



        return (
            <KeyboardAvoidingView behavior={ (Platform.OS === 'ios') ? 'padding' : null }
                                  keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
                                  style={[{width:"100%", height: "100%", backgroundColor: "transparent"},this.props.style]}>

                {!this.props.hideSearchBar &&
                    <GSearchBar2
                        onChangeText={input => this.setState({input}, input => this._debounceSearch(input))}
                        onSubmitEditing={() => this.tryPerformSearch(0)}
                        placeholder={this.props.placeholder}
                        value={this.state.input}
                        autoFocus
                        style={{
                            paddingTop: 10,
                            paddingBottom: 5,
                            paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR}}
                    />
                }

                { showTabs && <TabView
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this.renderScene.bind(this)}
                    swipeEnabled={false}
                    renderTabBar={this.renderHeader.bind(this)}
                    onIndexChange={this.handleIndexChange.bind(this)}
                    keyboardShouldPersistTaps='always'
                    renderPager={props => <PagerPan {...props} />}
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
        const category = this.props.categories[route.key]

        const renderOptions = category && category.renderOptions
        const onNewOptionsCategory = _.curryRight(this.onNewOptions)(category).bind(this)
        const searchOptions: SearchOptions = this.getSearchOptions(category.type) || {}

        return <View style={{flex:1}}>
            {renderOptions && renderOptions(searchOptions, onNewOptionsCategory)}
            {this.renderSearchPage(category)}
        </View>
    };

    renderSearchPage(category: SearchCategory) {
        let searchState : SearchState = this.state.searches[this.state.searchKey]

        if (!searchState) return category.renderEmpty
        if (searchState.requestState === 'sending' && searchState.page === 0) return <FullScreenLoader/>
        if (searchState.requestState === 'ko')
            return <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t("errors.generic")}</Text>
        if (searchState.data && searchState.data.length === 0)
            return <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t("lineups.search.empty")}</Text>

        const data = _.flatten(searchState.data)

        if (data.length === 0 ) {
            return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>{i18n.t("lineups.search.empty")}</Text>
            </View>
        }
        return <View style={{flex: 1}}>
            <FlatList
                data={data}
                renderItem={category.renderItem}
                ListFooterComponent={() => this.renderSearchFooter(searchState)}
                keyExtractor={(item) => item.id}
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps='always'/>
        </View>
    }

    renderSearchFooter(searchState: SearchState) {
        if (!searchState) return null;
        let nextPage = searchState.page + 1;

        let hasMore = nextPage < searchState.nbPages;
        if (!hasMore) return null;

        let isLoadingMore = searchState.requestState === 'sending';

        return (<Button
            isLoading={isLoadingMore}
            isDisabled={isLoadingMore}
            onPress={()=>{this.tryPerformSearch(nextPage)}}
            style={[styles.button, {marginTop: 15}]}
            disabledStyle={styles.button}
        >
            <Text style={{color: isLoadingMore ? Colors.greyishBrown : Colors.black}}>{i18n.t('actions.load_more')}</Text>
        </Button>);
    }


    _debounceSearch = _.debounce(() => this.tryPerformSearch(0), 500);

    tryPerformSearch(page: number) {

        let catType = this.getCurrentCategory().type;

        console.log(`performSearch:token=${this.state.input} page=${page}`);
        const {search, generateSearchKey, canSearch} = this.props.searchEngine;
        let searchOptions: SearchOptions = this.getSearchOptions(catType) || this.getCurrentCategory().defaultOptions || {};

        searchOptions.token = this.state.input || ''

        if (!canSearch(catType, searchOptions)) {
            console.log(`perform search aborted: cannot search`);
            this.setState({searchKey: ''})
            return;
        }

        const searchKey = generateSearchKey(catType, searchOptions)

        this.setState({searchKey})

        let prevSearchState : SearchState = this.state.searches[this.state.searchKey]

        if (prevSearchState) {
            prevSearchState.requestState = 'sending'
            prevSearchState.page = page
            this.setState({searches: {...this.state.searches, [searchKey]: prevSearchState}});
        } else {
            this.setState({searches: {...this.state.searches, [searchKey]: {requestState: 'sending', page}}});
        }

        search(catType, page, searchOptions)
            .catch(err => {
                console.warn(`error while performing search:`, err);
                this.setState({searches: {...this.state.searches, [searchKey]: {requestState: 'ko'}}});

            })
            .then((searchResult: SearchResult) => {
                console.debug('search results', searchResult)
                if (!searchResult || !searchResult.results) {
                    console.debug('ERROR: searchResult is falsey or searchResult.results is falsey')
                    // TODO: set state error
                    return;
                }


                let {results, page, nbPages} = searchResult;

                let data = prevSearchState && prevSearchState.data ? prevSearchState.data : []
                data[page] = results

                const searchState : SearchState = {
                    nbPages,
                    page,
                    searchKey,
                    data,
                    requestState: 'ok',
                }
                let prevState = this.state

                this.setState({searches: {...prevState.searches, [searchKey]: searchState}}, () => {
                    console.log(`Search state set for key ${searchKey} and state`, searchState);
                });

                // TODO: Eliot add pagination
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

