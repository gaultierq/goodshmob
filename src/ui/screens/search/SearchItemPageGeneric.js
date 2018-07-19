// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchItemCategoryType,} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import ItemCell from "../../components/ItemCell"
import {__createSearchItemSearcher} from "../../../helpers/SearchHelper"
import SearchListResults from "../searchListResults"

export type SearchItemsGenOptions = {input: string}

type SMS = {
    search: SearchEngine<SearchItemsGenOptions>,
    searchOptions: SearchItemsGenOptions,

}
type SMP = {
    category: SearchItemCategoryType,
    placeholder: string
}

export default class SearchItemPageGeneric extends React.Component<SMP, SMS> {

    constructor(props: SMP) {
        super(props)
        this.state = {
            searchOptions: {
                input: ''
            },
            search: {
                search: __createSearchItemSearcher(props.category),
                canSearch: searchOptions => Promise.resolve(!_.isEmpty(searchOptions.input))
            }
        }
    }

    render() {
        return (
            <View>
                <GSearchBar2
                    onChangeText={(input: string)  => {this.setState({searchOptions: {...this.state.searchOptions, input}})}}
                    value={_.get(this.state, this.state.searchOptions.input)}
                    style={styles1.searchBar}
                    placeholder={this.props.placeholder}
                    autoFocus
                />
                <SearchMotor
                    searchEngine={this.state.search}
                    renderResults={state => <SearchListResults searchState={state} renderItem={({item}) => <ItemCell item={item}/>} />}
                    searchOptions={this.state.searchOptions}
                />
            </View>
        )
    }
}


const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR
    }
})
