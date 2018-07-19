// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine} from "../../../helpers/SearchHelper"
import {__createSearchItemSearcher} from "../../../helpers/SearchHelper"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import {getPosition, SearchPlacesOption} from "./searchplacesoption"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchPage from "../searchpage"
import ItemCell from "../../components/ItemCell"
import type {RNNNavigator} from "../../../types"

export type SearchItemsPlacesOptions = SearchItemsGenOptions & {
    aroundMe: boolean
}

type SMS = {
    search: SearchEngine<SearchItemsPlacesOptions>,
    searchOptions: SearchItemsPlacesOptions,

}
type SMP = {
    navigator: RNNNavigator
}

export default class SearchItemPagePlaces extends React.Component<SMP, SMS> {



    constructor(props: SMP) {
        super(props)
        this.state = {
            searchOptions: {
                input: '',
                aroundMe: true
            },
            search: {
                search: __createSearchItemSearcher('places'),
                canSearch: searchOptions => Promise.resolve(!_.isEmpty(searchOptions.input))
            }
        }
    }

    render() {

        const onNewPosition = (newPosition) => {
            getPosition(newPosition).then((detailedPosition) => {
                // We need to merge the origal object, with the newPosition (contains aroundMe),
                // and the lat and lng if they are not defined
                const newOptions = {...currentOptions,
                    ...newPosition,
                    ...{lat: detailedPosition.latitude, lng: detailedPosition.longitude}
                }
                onNewOptions(newOptions)
            })
        }

        return (
            <View>
                <GSearchBar2
                    onChangeText={(input: string)  => {this.setState({searchOptions: {...this.state.searchOptions, input}})}}
                    value={_.get(this.state, this.state.searchOptions.input)}
                    style={styles1.searchBar}
                    placeholder={"# places"}
                    autoFocus
                />

                <SearchPlacesOption
                    {...this.state.searchOptions}
                    onNewOptions={onNewPosition}
                    // onSearchSubmited={onSearchSubmited}
                    navigator={this.props.navigator}
                />

                <SearchPage
                    searchEngine={this.state.search}
                    renderItem={({item}) => <ItemCell item={item}/>}
                    searchOptions={this.state.searchOptions}
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
