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

import type {
    CannotSearchReason,
    SearchEngine,
    SearchOptions,
    SearchResult,
    SearchState,
} from "../../helpers/SearchHelper"


//token -> {data, hasMore, isSearching}

//search query KEY: token x category x options
export interface ISearchMotor {
    search1(options: SearchOptions, soft: boolean): void;
}

export type Props<SO> = {
    searchEngine: SearchEngine<SO>,
    renderResults: (SearchState, () => void) => Node,
    renderBlank?: (cannot: CannotSearchReason) => Node,
    ref?: ISearchMotor => void,
    searchOptions: SO,

};

//options: page x location? x
export type State = {
    searches: { [SearchKey]: SearchState},
    searchKey: string,
    cannot: ?CannotSearchReason,
};

// this guy is responsible for making search requests
export default class SearchMotor<SO> extends Component<Props<SO>, State> implements ISearchMotor {

    state : State = {
        searches: {},
        cannot: null
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
        const cannot = this.state.cannot || (_.isUndefined(searchState) ? 'blank' : null)

        if (cannot != null && this.props.renderBlank) {
            return this.props.renderBlank(cannot)
        }

        return this.props.renderResults(searchState, this.onLoadMore.bind(this))
    }

    async updateSearchState(searchKey: string, newState: Object) {
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
        return _.debounce(() => this.tryPerformSearch(searchOptions, page), 500, {
            'leading': true,
        })();
    }


    async tryPerformSearch(searchOptions: SO, page: number) {


        const {search, canSearch} = this.props.searchEngine;
        let generateSearchKey = this.generateSearchKey.bind(this)

        // searchOptions.token = this.state.input || ''

        let searchKey = ''
// <<<<<<< HEAD
//         let prevSearchState: SearchState

//         canSearch(searchOptions)
//             .catch(err => {
//                 console.log(`perform search aborted: cannot search`);
//                 this.setState({searchKey: ''})
//             })
//             .then(() => {
//                 console.log('searching')
//                 searchKey = generateSearchKey(searchOptions)
//                 this.setState({searchKey})

//                 prevSearchState = this.getSearchState(searchKey)

//                 let newState = {
//                     requestState: 'sending',
//                     page
//                 }
//                 this.updateSearchState(searchKey, newState)
// // =======
        let prevSearchState: SearchState;
// >>>>>>> rm aroundme from place selector


        let cannot = await canSearch(searchOptions)
        this.setState({cannot})
        if (cannot) return


        console.log('searching')
        searchKey = generateSearchKey(searchOptions)
        await this.setState({searchKey})

        prevSearchState = this.getSearchState(searchKey)

        let newState = {
            requestState: 'sending',
            isEmpty: false,
            page
        }
        this.updateSearchState(searchKey, newState)

        let searchResult: ?SearchResult
        try {
            searchResult = await search(searchOptions, page)
        }
        catch (err) {
            console.warn(`error while performing search:`, err);
            this.setState({searches: {...this.state.searches, [searchKey]: {requestState: 'ko'}}});
            searchResult = null
        }

        if (!searchResult || !searchResult.results) {
            console.debug('ERROR: searchResult is falsey or searchResult.results is falsey')
            // TODO: set state error
            return;
        }

        let {results, nbPages} = searchResult;
        page = searchResult.page

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

        await this.updateSearchState(searchKey, searchState)
    }
}
