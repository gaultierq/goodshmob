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
    renderResults: SearchState => Node,
    renderEmpty?: () => Node,
    ref?: ISearchPage => void,
    searchOptions: SO,

};

//options: page x location? x
export type State = {
    searches: { [SearchKey]: SearchState},
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

        const searchKey = this.generateSearchKey(this.props.searchOptions)
        return (
            <KeyboardAvoidingView behavior={ (Platform.OS === 'ios') ? 'padding' : null }
                                  keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
                                  style={[{width:"100%", height: "100%", backgroundColor: Colors.white}]}>


                {this.renderSearchPage(this.getSearchState(searchKey))}
            </KeyboardAvoidingView>

        );
    }

    generateSearchKey(opt: any) {
        return JSON.stringify(opt)
    }

    search1(options: SearchOptions, soft: boolean = false) {
        this.tryPerformSearch(options, 0)
    }

    getSearchState(searchKey: string): SearchState {
        return this.state && this.state.searches && this.state.searches[searchKey]
    }

    renderSearchPage(searchState: SearchState) {
        return this.props.renderResults(searchState)


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

    renderSearchFooter(searchState: SearchState) {
        if (!searchState) return null;
        let nextPage = searchState.page + 1;

        let hasMore = nextPage < searchState.nbPages;
        if (!hasMore) return null;

        let isLoadingMore = searchState.requestState === 'sending';

        return (<Button
            isLoading={isLoadingMore}
            isDisabled={isLoadingMore}
            onPress={()=>{this.tryPerformSearch(this.props.searchOptions, nextPage)}}
            style={[styles.button, {marginTop: 15}]}
            disabledStyle={styles.button}
        >
            <Text style={{color: isLoadingMore ? Colors.greyishBrown : Colors.black}}>{i18n.t('actions.load_more')}</Text>
        </Button>);
    }

    componentDidUpdate(prevProps: Props<SO>) {
        const searchOptions = this.props.searchOptions
        if (prevProps.searchOptions !== searchOptions
            //why ?
            && !!searchOptions
        ) {
            this.tryPerformSearch(searchOptions, 0)
        }
    }




    // _debounceSearch = _.debounce(() => this.tryPerformSearch(0), 500);

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
                    isEmpty: false,
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

