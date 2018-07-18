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
import Icon from 'react-native-vector-icons/MaterialIcons'

import type {RNNNavigator, SearchToken} from "../../types"
import {SearchKey} from "../../types"
import Button from 'apsl-react-native-button'
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR, TAB_BAR_PROPS} from "../UIStyles"
import {Navigation} from 'react-native-navigation'
import {Colors} from "../colors"
import GSearchBar2 from "../components/GSearchBar2"
import GMap from "../components/GMap"
import ActionButton from 'react-native-action-button';

import type {
    SearchCategory,
    SearchCategoryType,
    SearchEngine,
    SearchOptions,
    SearchResult,
    SearchState,
} from "../../helpers/SearchHelper"
import {FullScreenLoader} from "../UIComponents"
import {getPosition} from "./searchplacesoption"


//token -> {data, hasMore, isSearching}

//search query KEY: token x category x options
//options: page x location? x
export type State = {
    input?: SearchToken,
    routes: Array<*>,
    searches: { [SearchKey]: SearchState},
    searchKey: string,
    index: number,
    displayMap?: boolean,

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
    mapRef: Node;
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
        if (newOptions.lat && newOptions.lng) {
            console.log('newOptions', this, this.mapRef, newOptions)
            this.updateMapPosition(newOptions)
        }

        this._debounceSearch();
    }

    updateMapPosition(position: Object) {
        const options = {
            longitude: position.lng,
            latitude: position.lat,
            latitudeDelta: 0.1822,
            longitudeDelta: 0.0821,
        }
        if (this.mapRef) {
            // HACK: Timeout is here because if the map is not visible,
            // setting the position will show a too big area
            setTimeout(() => {
                this.mapRef.animateToRegion(options)
            }, 100)
        }
    }

    render() {

        let nCat = this.props.categories.length;
        let hasSearched = !_.isEmpty(this.state.searches);

        let cat = this.getCurrentCategory();

        const showTabs = nCat > 1 && (hasSearched || true);



        return (
            <KeyboardAvoidingView behavior={ (Platform.OS === 'ios') ? 'padding' : null }
                                  keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
                                  style={[{width:"100%", height: "100%", backgroundColor: Colors.white},this.props.style]}>

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
                    nCat === 1 && this.renderCategory(this.props.categories[0])
                }

            </KeyboardAvoidingView>

        );
    }

    getSearchOptions(catType: SearchCategoryType) {
        return this.searchOptions[catType] || this.getCurrentCategory().defaultOptions || {};
    }

    renderHeader(props: *) {
        return <TabBar {...TAB_BAR_PROPS} {...props}/>
    }

    getSearchState(searchKey: string): SearchState {
        return this.state.searches[searchKey] || {isEmpty: true}
    }

    renderScene({ route }: *) {
        const category = this.props.categories[route.key]
        return this.renderCategory(category)
    }

    renderCategory(category: SearchCategory) {
        const renderOptions = category && category.renderOptions
        const onNewOptionsCategory = _.curryRight(this.onNewOptions)(category).bind(this)
        const searchOptions: SearchOptions = this.getSearchOptions(category.type)
        const searchKey = this.state.searchKey
        let searchState : SearchState = this.getSearchState(searchKey)

        const displayMap = category.geoResult && this.state.displayMap

        return <View style={{flex:1}}>
            {renderOptions && renderOptions(searchOptions, onNewOptionsCategory, category)}
            <View style={{flex:1}}>
                {this.renderSearchPage(category, searchState)}
                {category.geoResult && this.renderMap(category, searchState, onNewOptionsCategory, searchOptions)}

            </View>
            {category.geoResult &&
            <ActionButton buttonColor="rgba(231,76,60,1)"
                          icon={<Icon name={displayMap ? 'list' : 'map'} color={Colors.white} size={32} />}
                          onPress={() => {
                              this.setState({displayMap: !this.state.displayMap})

                              if (!this.state.displayMap) {
                                  getPosition(searchOptions)
                                      .then(position => {
                                          this.updateMapPosition({lat: position.latitude, lng: position.longitude})
                                      })
                              }
                          }}
            />}
        </View>
    }

    renderMap(category: SearchCategory, searchState: SearchState, onNewOptions: any, searchOptions: SearchOptions) {
        return <View style={[{position: 'absolute', zIndex: 1000, left:0, right:0, top:0, bottom:0},
            this.state.displayMap ? {} : {height:0}]}>

            <GMap category={category}
                  searchState={searchState}
                  searchOptions={searchOptions}
                  setRef={this.setMapRef.bind(this)}
                  onNewOptions={onNewOptions}/>
        </View>

    }
    setMapRef(ref: Node) {
        console.debug('setting map ref', ref, this, this.mapRef)
        if (ref !== null) {
            this.mapRef = ref
        }
    }

    updateSearchState(searchKey: string, newState: Object) {
        this.setState({searches: {...this.state.searches,
                [searchKey]: {...this.state.searches[searchKey], ...newState}}})
    }

    renderSearchPage(category: SearchCategory, searchState: SearchState) {

        if (searchState.isEmpty) return category.renderEmpty
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

        const {search, generateSearchKey, canSearch} = this.props.searchEngine;
        let searchOptions: SearchOptions = this.getSearchOptions(catType);
        canSearch
        console.debug('tryPerformSearch', searchOptions);
        searchOptions.token = this.state.input || ''

        let searchKey = ''
        let prevSearchState: SearchState

        canSearch(catType, searchOptions)
            .catch(err => {
                console.log(`perform search aborted: cannot search`);
                this.setState({searchKey: ''})
            })
            .then(() => {
                console.log('searching')
                searchKey = generateSearchKey(catType, searchOptions)
                this.setState({searchKey})

                prevSearchState = this.getSearchState(searchKey)

                let newState = {
                    requestState: 'sending',
                    isEmpty: false,
                    page
                }
                this.updateSearchState(searchKey, newState)

                return search(catType, page, searchOptions)

            })
            .catch(err => {
                console.warn(`error while performing search:`, err);
                this.setState({searches: {...this.state.searches, [searchKey]: {requestState: 'ko'}}});

            })
            .then((searchResult: SearchResult) => {
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
                    isEmpty: false
                }

                this.updateSearchState(searchKey, searchState)
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

