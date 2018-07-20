// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine} from "../../../helpers/SearchHelper"
import {__createSearchItemSearcher} from "../../../helpers/SearchHelper"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import {getPosition, SearchPlacesOption} from "./searchplacesoption"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import ItemCell from "../../components/ItemCell"
import type {RNNNavigator} from "../../../types"
import type {SearchItemsGenOptions} from "./SearchItemPageGeneric"
import type {GeoPosition} from "./searchplacesoption"
import SearchListResults from "../searchListResults"
import {Colors} from "../../colors"
import ActionButton from "react-native-action-button"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import BlankSearch, {renderBlankIcon} from "../../../ui/components/BlankSearch"

export type SearchItemsPlacesOptions = SearchItemsGenOptions & {
    lat?: number | null,
    lng?: number | null,
}

type SMS = {
    search: SearchEngine<SearchItemsPlacesOptions>,
    searchOptions: SearchItemsPlacesOptions,
    mapDisplay: boolean,

}
type SMP = {
    navigator: RNNNavigator
}

export default class SearchItemPagePlaces extends React.Component<SMP, SMS> {


    constructor(props: SMP) {
        super(props)
        this.state = {
            mapDisplay: false,
            searchOptions: {
                input: '',
            },
            search: {
                search: __createSearchItemSearcher('places'),
                canSearch: searchOptions => Promise.resolve(!_.isEmpty(searchOptions.input))
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
                    placeholder={"# places"}
                    autoFocus
                />

                <SearchPlacesOption
                    navigator={this.props.navigator}
                    onNewOptions={(pos: GeoPosition) => {
                        this.setState({searchOptions: {...this.state.searchOptions, ...pos}})
                    }}
                />

                <SearchMotor
                    searchEngine={this.state.search}
                    renderResults={state => <SearchListResults searchState={state} renderItem={({item}) => <ItemCell item={item}/>} />}
                    searchOptions={this.state.searchOptions}
                    renderBlank={() => <BlankSearch
                        icon={renderBlankIcon('places')}
                        text={i18n.t("search_item_screen.placeholder.places")}
                    />}
                />

                <ActionButton buttonColor="rgba(231,76,60,1)"
                              icon={<MaterialIcon name={this.state.mapDisplay ? 'list' : 'map'} color={Colors.white} size={32} />}
                              onPress={() => {
                                  this.setState({mapDisplay: !this.state.mapDisplay})
                              }}
                />
            </View>
        )
    }
}

//TODO: factorize
const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR
    }
})
