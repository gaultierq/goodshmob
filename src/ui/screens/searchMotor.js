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

import {SearchKey} from "../../types"
import Button from 'apsl-react-native-button'
import {Navigation} from 'react-native-navigation'
import {Colors} from "../colors"

import type {SearchEngine, SearchOptions, SearchResult, SearchState,} from "../../helpers/SearchHelper"
import {FullScreenLoader} from "../UIComponents"


//token -> {data, hasMore, isSearching}

//search query KEY: token x category x options
export interface ISearchPage {
    search1(options: SearchOptions, soft: boolean): void;
}

export type Props<SO> = {
    searchEngine: SearchEngine<SO>,
    renderResults: (SearchState, () => void) => Node,
    renderBlank?: () => Node,
    ref?: ISearchPage => void,
    searchOptions: SO,

};

//options: page x location? x
export type State = {
    searches: { [SearchKey]: SearchState},
    searchKey: string
};

// this guy is responsible for making search requests
export default class SearchMotor<SO> extends Component<Props<SO>, State> implements ISearchPage {

    state : State = {
        searches: {}
    };

    static defaultProps = {index: 0, autoSearch: true, hideSearchBar: false};


    componentDidMount() {
        if (this.props.ref) {
            this.props.ref(this)
        }
    }

    render() {

        const searchKey = this.state.searchKey
        return (
            <View behavior={ (Platform.OS === 'ios') ? 'padding' : null }
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
                  style={[{flex:1, backgroundColor: 'white'}]}>


                {this.renderSearchPage(this.getSearchState(searchKey))}
            </View>

        );
    }

    generateSearchKey(opt: any) {
        return JSON.stringify(opt)
    }

    search1(options: SearchOptions, soft: boolean = false) {
        this._debounceSearch(options, 0)
    }

    getSearchState(searchKey: string): SearchState {
        return this.state && this.state.searches && this.state.searches[searchKey]
    }

    onLoadMore() {
        const searchOptions = this.props.searchOptions
        const searchKey = this.generateSearchKey(searchOptions)
        const searchState = this.getSearchState(searchKey)
        this.tryPerformSearch(searchOptions, searchState.page + 1)
    }

    renderSearchPage(searchState: SearchState) {
        if (_.isUndefined(searchState) && this.props.renderBlank) {
            return this.props.renderBlank()
        }
        return this.props.renderResults(searchState, this.onLoadMore.bind(this))


        //
        //
        // searchState = searchState || {}
        // if (searchState.requestState === 'sending' && searchState.page === 0) return <FullScreenLoader/>
        // if (searchState.requestState === 'ko')
        //     return <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t("errors.generic")}</Text>
        // if (searchState.data && searchState.data.length === 0)
        //     return <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t("lineups.search.empty")}</Text>
        //
        // const data = _.flatten(searchState.data)
        //
        // if (data.length === 0 ) {
        //     return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        //         <Text>{i18n.t("lineups.search.empty")}</Text>
        //     </View>
        // }
        // return <View style={{flex: 1}}>
        //     <FlatList
        //         data={data}
        //         renderItem={this.props.renderItem}
        //         ListFooterComponent={() => this.renderSearchFooter(searchState)}
        //         keyExtractor={(item) => item.id}
        //         onScrollBeginDrag={Keyboard.dismiss}
        //         keyboardShouldPersistTaps='always'/>
        // </View>
    }



    updateSearchState(searchKey: string, newState: Object) {
        this.setState(
            {
                searches: {
                    ...this.state.searches,
                    [searchKey]: {...this.state.searches[searchKey], ...newState}
                }
            }
        )
    }



    componentDidUpdate(prevProps: Props<SO>) {
        const searchOptions = this.props.searchOptions
        if (prevProps.searchOptions !== searchOptions
            //why ?
            && !!searchOptions
        ) {
            this._debounceSearch(searchOptions, 0)
        }
    }

    _debounceSearch(searchOptions: ?SO, page: number) {
        return _.debounce(() => this.tryPerformSearch(searchOptions, page), 500)();
    }


    tryPerformSearch(searchOptions: ?SO, page: number) {

        const {search, canSearch} = this.props.searchEngine;
        let generateSearchKey = this.generateSearchKey.bind(this)

        // searchOptions.token = this.state.input || ''

        let searchKey = ''
        let prevSearchState: SearchState

        canSearch(searchOptions)
            .catch(err => {
                console.log(`perform search aborted: cannot search`);
                this.setState({searchKey: ''})
            })
            .then(() => {
                console.log('searching')
                searchKey = generateSearchKey(searchOptions)
                this.setState({searchKey})

                prevSearchState = this.getSearchState(searchKey)

                let newState = {
                    requestState: 'sending',
                    page
                }
                this.updateSearchState(searchKey, newState)

                return search(searchOptions, page)

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
}
