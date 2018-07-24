// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine} from "../../../helpers/SearchHelper"
import {
    __createSearchItemSearcher,
    PERMISSION_EMPTY_INPUT, PERMISSION_EMPTY_POSITION, renderResource
} from "../../../helpers/SearchHelper"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
import {
    getPosition,
    renderAskPermission,
    SearchPlacesOption
} from "./searchplacesoption"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import ItemCell from "../../components/ItemCell"
import type {RNNNavigator} from "../../../types"
import type {SearchItemsGenOptions} from "./SearchGeneric"
import type {GeoPosition} from "./searchplacesoption"
import SearchListResults from "../searchListResults"
import {Colors} from "../../colors"
import ActionButton from "react-native-action-button"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import BlankSearch, {renderBlankIcon} from "../../../ui/components/BlankSearch"

export type SearchItemsPlacesOptions = SearchItemsGenOptions & {
    lat?: ?number,
    lng?: ?number,
    permissionError: ?string
}

type SMS = {
    search: SearchEngine<SearchItemsPlacesOptions>,
    searchOptions: SearchItemsPlacesOptions,
    mapDisplay: boolean,

}
type SMP = {
    navigator: RNNNavigator
}

export default class SearchPlaces extends React.Component<SMP, SMS> {


    constructor(props: SMP) {
        super(props)
        this.state = {
            mapDisplay: false,
            searchOptions: {
                input: '',
                permissionError: PERMISSION_EMPTY_POSITION,
            },
            search: {
                search: __createSearchItemSearcher('places'),

                missingSearchPermissions: searchOptions => {
                    if (_.isEmpty(searchOptions.input)) {
                        return PERMISSION_EMPTY_INPUT
                    }

                    if (searchOptions.permissionError) return searchOptions.permissionError

                    if (!searchOptions.lat  || !searchOptions.lng) {
                        return PERMISSION_EMPTY_POSITION
                    }

                    return null
                },


                renderMissingPermission: (searchOptions, missingPermission) => {
                    if (missingPermission === PERMISSION_EMPTY_INPUT) {
                        return <BlankSearch
                            icon={renderBlankIcon('places')}
                            text={i18n.t("search_item_screen.placeholder.places")}
                        />
                    }
                    return renderAskPermission(missingPermission, (status) => this.setState({searchOptions: {...this.state.searchOptions, ...status}}))
                }
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
                    renderResults={(state, onLoadMore) => <SearchListResults
                        searchState={state}
                        renderItem={renderResource.bind(this)}
                    />}
                    searchOptions={this.state.searchOptions}
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
