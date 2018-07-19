// @flow

import type {Node} from 'react'
import React from 'react'
import {StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchState,} from "../../../helpers/SearchHelper"
import {__createAlgoliaSearcher, makeBrowseAlgoliaFilter2} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import SearchMotor from "../searchMotor"
import ItemCell from "../../components/ItemCell"
import {currentUserId, logged} from "../../../managers/CurrentUser"
import {buildData} from "../../../helpers/DataUtils"
import {connect} from "react-redux"
import {AlgoliaClient, createResultFromHit} from "../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {seeActivityDetails} from "../../Nav"
import GTouchable from "../../GTouchable"
import {SocialScopeSelector} from "./socialscopeselector"
import type {GeoPosition} from "./searchplacesoption"
import {getPosition, SearchPlacesOption} from "./searchplacesoption"
import type {RNNNavigator, Saving} from "../../../types"
import SearchListResults from "../searchListResults"
import GMap from "../../components/GMap"
import {Colors} from "../../colors"
import ActionButton from "react-native-action-button"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

type SMS = {
    search: SearchEngine<BrowseItemsGenOptions>,
    searchOptions: BrowseItemsGenOptions,
    mapDisplay: boolean

}

type SMP = {
    navigator: RNNNavigator
}
export type BrowseItemsGenOptions = {
    algoliaFilter?: string
}

@connect(state => ({
    data: state.data,
}))
@logged
export default class BrowseItemPagePlaces extends React.Component<SMP, SMS> {

    constructor(props: SMP) {
        super(props)

        let index = new Promise(resolve => {
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
        });


        this.state = {
            mapDisplay: false,
            searchOptions: {
            },
            search: {
                search: __createAlgoliaSearcher({
                    index: index,
                    parseResponse: (hits) => createResultFromHit(hits, {}, true),
                }),
                canSearch: searchOptions => Promise.resolve(true)
            }
        }
    }

    render() {
        const mapDisplay = this.state.mapDisplay
        return (
            <View style={{flex: 1, width: '100%', height: '100%'}}>
                <SocialScopeSelector onScopeChange={scope => {
                    this.setState({
                        searchOptions: {
                            ...this.state.searchOptions,
                            algoliaFilter: makeBrowseAlgoliaFilter2(scope, 'places', this.getUser())
                        }
                    })}
                }/>

                <SearchPlacesOption
                    navigator={this.props.navigator}
                    onNewOptions={(pos: GeoPosition) => {
                        this.setState({searchOptions: {...this.state.searchOptions, ...pos}})
                    }}
                />

                <SearchMotor
                    searchEngine={this.state.search}
                    renderResults={this._renderResults}
                    searchOptions={this.state.searchOptions}
                />

                <ActionButton buttonColor="rgba(231,76,60,1)"
                              icon={<MaterialIcon name={mapDisplay ? 'list' : 'map'} color={Colors.white} size={32} />}
                              onPress={() => {
                                  this.setState({mapDisplay: !this.state.mapDisplay})
                              }}
                />
            </View>
        )
    }

    _renderResults = (state: SearchState) => {
        if (this.state.mapDisplay) return <GMap searchState={state}/>
        else return <SearchListResults searchState={state} renderItem={this.renderItem.bind(this)}/>
    }

//to factorize
    renderItem({item}: {item: Saving}) {

        let saving = item;

        let resource = saving.resource;

        //TODO: this is hack
        if (!resource) return null;

        return (
            <GTouchable onPress={() => seeActivityDetails(this.props.navigator, saving)}>
                <ItemCell item={resource}/>
            </GTouchable>
        )
    }

    //TODO: use selector
    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
