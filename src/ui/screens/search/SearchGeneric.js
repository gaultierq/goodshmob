// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchItemCategoryType,} from "../../../helpers/SearchHelper"
import {__createSearchItemSearcher, PERMISSION_EMPTY_INPUT, renderResource} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import SearchListResults from "../searchListResults"
import BlankSearch, {renderBlankIcon} from "../../../ui/components/BlankSearch"

export type SearchItemsGenOptions = {input: string}

type SMS = {
    search: SearchEngine<SearchItemsGenOptions>,
    searchOptions: SearchItemsGenOptions,

}
type SMP = {
    category: SearchItemCategoryType,
    placeholder: string
}

export default class SearchGeneric extends React.Component<SMP, SMS> {

    constructor(props: SMP) {
        super(props)
        this.state = {
            searchOptions: {
                input: '',
            },
            search: {
                search: __createSearchItemSearcher(props.category),
            }
        }
    }

    render() {

        return (
            <View style={{flex: 1}}>
                <GSearchBar2
                    onChangeText={(input: string)  => {this.setState({searchOptions: {...this.state.searchOptions, input}})}}
                    value={_.get(this.state, this.state.searchOptions.input)}
                    style={styles1.searchBar}
                    placeholder={this.props.placeholder}
                    autoFocus
                />
                <SearchMotor
                    searchEngine={this.state.search}
                    renderResults={(state, onLoadMore) => <SearchListResults
                        searchState={state}
                        renderItem={renderResource.bind(this)}
                    />}
                    searchOptions={this.state.searchOptions}
                    missingSearchPermissions={this._missingSearchPermissions}
                    renderMissingPermission={this._renderMissingPermission}
                />
            </View>
        )
    }
    _missingSearchPermissions = searchOptions => {
        if (!_.isEmpty(searchOptions.input)) {
            return null
        }
        return PERMISSION_EMPTY_INPUT
    }

    _renderMissingPermission = (searchOptions, missingPermission) => {
        if (missingPermission === PERMISSION_EMPTY_INPUT) {
            return <BlankSearch
                icon={renderBlankIcon(this.props.category)}
                text={i18n.t("search_item_screen.placeholder." + this.props.category)}
            />
        }
        return <View/>
    }
}


const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR
    }
})
