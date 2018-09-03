// @flow

import type {Node} from 'react'
import React from 'react'
import {Button, StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchState} from "../../../helpers/SearchHelper"
import {__createAlgoliaSearcher, makeBrowseAlgoliaFilter2, renderItem, PERMISSION_EMPTY_POSITION} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import type {ISearchMotor} from "../searchMotor"
import SearchMotor from "../searchMotor"
import {currentUserId, logged} from "../../../managers/CurrentUser"
import {buildData} from "../../../helpers/DataUtils"
import {connect} from "react-redux"
import {AlgoliaClient, createResultFromHit} from "../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {SocialScopeSelector} from "./socialscopeselector"
import type {GeoPosition, IPositionSelector} from "./searchplacesoption"
import {SearchPlacesOption, renderAskPermission} from "./searchplacesoption"
import type {RNNNavigator} from "../../../types"
import SearchListResults from "../searchListResults"
import GMap from "../../components/GMap"
import {Colors} from "../../colors"
import ActionButton from "react-native-action-button"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import {seeActivityDetails} from "../../Nav"


type SMS = {
    searchOptions: BrowseItemsPlacesOptions,
    mapDisplay: boolean

}

type SMP = {
    navigator: RNNNavigator,
    focused?: boolean,
    scope?: string

}
export type BrowseItemsGenOptions = {
    algoliaFilter?: string,
}

export type BrowseItemsPlacesOptions = BrowseItemsGenOptions & {
    lat?: number,
    lng?: number,
    permissionError: ?string
}

@connect(state => ({
    data: state.data,
}))
@logged
export default class BrowsePlaces extends React.Component<SMP, SMS> {


    searchMotor: ISearchMotor<BrowseItemsPlacesOptions>
    positionSelector: IPositionSelector

    constructor(props: SMP) {
        super(props)


        this.state = {
            mapDisplay: false,
            searchOptions: {
                algoliaFilter: makeBrowseAlgoliaFilter2('me', 'places', this.getUser()),
                permissionError: PERMISSION_EMPTY_POSITION,
            },
        }
    }
    index: Promise<any> = new Promise(resolve => {
        AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
            index.setSettings({
                    searchableAttributes: [
                        'item_title',
                        'list_name'
                    ],
                    attributeForDistinct: 'item_id',
                    distinct: true,
                    attributesForFaceting: ['user_id', 'type'],
                }
            );
            resolve(index);
        });
    })

    search: SearchEngine<BrowseItemsPlacesOptions> = __createAlgoliaSearcher({
        index: this.index,
        geoSearch: true,
        parseResponse: (hits) => createResultFromHit(hits, {}, true),
    })


    render() {
        const mapDisplay = this.state.mapDisplay
        return (
            <View style={{flex: 1}}>
                <SocialScopeSelector
                    initialValue={this.props.scope}
                    onScopeChange={scope => {
                    this.setState({
                        searchOptions: {
                            ...this.state.searchOptions,
                            algoliaFilter: makeBrowseAlgoliaFilter2(scope, 'places', this.getUser())
                        }
                    })}
                }/>


                <SearchPlacesOption
                    ref={ref => this.positionSelector = ref}
                    navigator={this.props.navigator}
                    onNewOptions={(pos: GeoPosition) => {
                        this.setState({searchOptions: {...this.state.searchOptions, ...pos}})
                    }}
                />

                <SearchMotor
                    searchEngine={this.search}
                    renderResults={this._renderResults}
                    searchOptions={this.state.searchOptions}
                    ref={ref => this.searchMotor = ref}
                    canSearch={this._canSearch}
                    renderMissingPermission={this._renderMissingPermission}
                />

                <ActionButton buttonColor={Colors.orange}
                              icon={<MaterialIcon name={mapDisplay ? 'list' : 'map'} color={Colors.white} size={32} />}
                              onPress={() => {
                                  this.setState({mapDisplay: !this.state.mapDisplay})
                              }}
                />
            </View>
        )
    }
    _canSearch = searchOptions => {
        if (!this.props.focused) return 'not_focused'
        if (searchOptions.permissionError) return searchOptions.permissionError

        if (!searchOptions.lat || !searchOptions.lng) {
            return PERMISSION_EMPTY_POSITION
        }

        return null
    }

    _renderMissingPermission = (searchOptions: BrowseItemsPlacesOptions, missingPermission: string) => {
        return renderAskPermission(missingPermission, (status) => this.setState({searchOptions: {...this.state.searchOptions, ...status}}))
    }

    _renderResults = (state: SearchState) => {
        if (this.state.mapDisplay) return <GMap searchState={state} onItemPressed={(item) => seeActivityDetails(this.props.navigator, item)}/>
        else return <SearchListResults searchState={state} renderItem={renderItem.bind(this)}/>
    }

    componentDidUpdate(prevProps: SMP) {
        // for "don't search on 1st render" feature
        if (prevProps.focused !== this.props.focused) {
            //disapointing
            if (this.searchMotor) this.searchMotor.search(this.state.searchOptions, false)
        }
    }

    //TODO: use selector
    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
