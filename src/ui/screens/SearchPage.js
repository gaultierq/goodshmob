// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
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
} from 'react-native';
import {TabBar, TabViewAnimated, TabViewPagerPan} from 'react-native-tab-view';

import {SearchBar} from 'react-native-elements'

import type {Item, List} from "../../types";
import {Navigation} from 'react-native-navigation';
import {FullScreenLoader} from "../UIComponents";
import type {SearchState} from "./search";


type PageProps = {
    renderItem: (item: *) => Node,
    search: SearchState,
    ListFooterComponent?: Node
};

type PageState = {
};


export default class SearchPage extends Component<PageProps, PageState> {


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
                    loadingFirst && <FullScreenLoader/>
                }
                {
                    !emptySearchResult &&
                    <FlatList
                        data={searchResult}
                        renderItem={this.props.renderItem}
                        keyExtractor={(item) => item.id}
                        ListFooterComponent={this.props.ListFooterComponent}
                        onScrollBeginDrag={Keyboard.dismiss}
                        keyboardShouldPersistTaps='always'
                    />
                }
                {emptySearchResult && <Text style={{alignSelf: "center", marginTop: 20}}>{i18n.t('lineups.search.empty')}</Text>}

            </View>

        );
    }
}
