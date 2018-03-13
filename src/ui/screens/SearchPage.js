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
import {TabBar, TabViewAnimated, TabViewPagerPan} from 'react-native-tab-view';

import {SearchBar} from 'react-native-elements'

import type {Item, List} from "../../types";
import {NavStyles} from "../UIStyles";
import {Navigation} from 'react-native-navigation';
import {Colors} from "../colors";
import Spinner from 'react-native-spinkit';
import type {SearchCategory, SearchState} from "./search";


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
