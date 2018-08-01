// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchState} from "../../../helpers/SearchHelper"
import {
    __createSearchItemSearcher,
    onNewItemSelected,
    PERMISSION_EMPTY_INPUT,
    PERMISSION_EMPTY_POSITION,
    renderResource
} from "../../../helpers/SearchHelper"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../../UIStyles"
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
import GMap from "../../components/GMap"

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
    focused?: boolean
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

    missingSearchPermissions = (searchOptions: SearchItemsPlacesOptions) => {
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
                    onNewOptions={(pos: GeoPosition) => {
                        this.setState({searchOptions: {...this.state.searchOptions, ...pos}})
                    }}
                />

                <SearchMotor
                    searchEngine={this.search}
                    renderResults={this._renderResults}
                    searchOptions={this.state.searchOptions}
                    missingSearchPermissions={this.missingSearchPermissions}
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
        if (this.state.mapDisplay) return <GMap searchState={state} onItemPressed={(item) => onNewItemSelected(item, this.props.navigator)}/>

        return <SearchListResults searchState={state} renderItem={renderResource.bind(this)}/>
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
