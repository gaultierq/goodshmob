// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchState} from "../../../helpers/SearchHelper"
import {
    __createSearchItemSearcher,
    PERMISSION_EMPTY_INPUT,
    PERMISSION_EMPTY_POSITION
} from "../../../helpers/SearchHelper"
import {LINEUP_PADDING} from "../../UIStyles"
import {renderAskPermission, SearchPlacesOption} from "./searchplacesoption"
import GSearchBar2 from "../../components/GSearchBar2"
import SearchMotor from "../searchMotor"
import type {RNNNavigator} from "../../../types"
import type {SearchItemsGenOptions} from "./SearchGeneric"
import SearchListResults from "../searchListResults"
import {Colors} from "../../colors"
import ActionButton from "react-native-action-button"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import BlankSearch, {renderBlankIcon} from "../../../ui/components/BlankSearch"
import GTouchable from "../../GTouchable"
import ItemCell from "../../components/ItemCell"
import SearchMap from "../../components/SearchMap"

export type SearchItemsPlacesOptions = SearchItemsGenOptions & {
    lat?: ?number,
    lng?: ?number,
    permissionError: ?string
}

type SMS = {
    searchOptions: SearchItemsPlacesOptions,
    mapDisplay: boolean,

}
type SMP = {
    navigator: RNNNavigator,
    focused?: boolean,
    onItemSelected: () => void
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
        }
    }

    search: SearchEngine<SearchItemsPlacesOptions> = __createSearchItemSearcher('places')

    canSearch = (searchOptions: SearchItemsPlacesOptions) => {
        if (_.isEmpty(searchOptions.input)) {
            return PERMISSION_EMPTY_INPUT
        }

        if (searchOptions.permissionError) return searchOptions.permissionError

        if (!searchOptions.lat  || !searchOptions.lng) {
            return PERMISSION_EMPTY_POSITION
        }

        return null
    }

    renderMissingPermission = (searchOptions: SearchItemsPlacesOptions, missingPermission: string) => {
        if (missingPermission === PERMISSION_EMPTY_INPUT) {
            return <BlankSearch
                icon={renderBlankIcon('places')}
                text={i18n.t("search_item_screen.placeholder.places")}
            />
        }
        return renderAskPermission(missingPermission, (status) => this.setState({searchOptions: {...this.state.searchOptions, ...status}}))
    }

    render() {

        return (
            <View style={{flex: 1}}>
                <GSearchBar2
                    onChangeText={(input: string)  => {this.setState({searchOptions: {...this.state.searchOptions, input}})}}
                    value={_.get(this.state, this.state.searchOptions.input)}
                    style={styles1.searchBar}
                    placeholder={i18n.t('search_item_screen.searchbar_placeholder.places')}
                    autoFocus={this.props.focused}

                />

                <SearchPlacesOption
                    navigator={this.props.navigator}
                    onNewOptions={(pos: GeoStatus) => {
                        this.setState({searchOptions: {...this.state.searchOptions, ...pos}})
                    }}
                />

                <SearchMotor
                    searchEngine={this.search}
                    renderResults={this._renderResults}
                    searchOptions={this.state.searchOptions}
                    canSearch={this.canSearch}
                    renderMissingPermission={this.renderMissingPermission}
                />

                <ActionButton buttonColor={Colors.orange}
                              icon={<MaterialIcon name={this.state.mapDisplay ? 'list' : 'map'} color={Colors.white} size={32} />}
                              onPress={() => {
                                  this.setState({mapDisplay: !this.state.mapDisplay})
                              }}
                />
            </View>
        )
    }

    _renderResults = (state: SearchState) => {
        if (this.state.mapDisplay) return (
            <SearchMap
                searchState={state}
                onItemPressed={(item) => this.props.onItemSelected(item)}
                EmptyComponent={() => (
                    <Text style={{backgroundColor: Colors.white, padding: 10}}>{i18n.t("lineups.search.empty")}</Text>
                )}
            />
        )

        return <SearchListResults searchState={state} renderItem={this._renderItem}
        />
    }

    _renderItem = ({item}) => (
        <GTouchable onPress={() => this.props.onItemSelected(item)}>
            <ItemCell item={item}/>
        </GTouchable>
    )
}

//TODO: factorize
const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING,
    }
})
