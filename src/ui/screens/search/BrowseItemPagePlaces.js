// @flow

import type {Node} from 'react'
import React from 'react'
import {Button, StyleSheet, Text, TextInput, View,} from 'react-native'
import type {SearchEngine, SearchState} from "../../../helpers/SearchHelper"
import {__createAlgoliaSearcher, makeBrowseAlgoliaFilter2, renderItem} from "../../../helpers/SearchHelper"
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
import Permissions from 'react-native-permissions'
import {seeActivityDetails} from "../../Nav"


type SMS = {
    search: SearchEngine<BrowseItemsGenOptions>,
    searchOptions: BrowseItemsPlacesOptions,
    mapDisplay: boolean

}

type SMP = {
    navigator: RNNNavigator,
    data: any
}
export type BrowseItemsGenOptions = {
    algoliaFilter?: string,
}

export type BrowseItemsPlacesOptions = BrowseItemsGenOptions & {
    lat?: number,
    lng?: number,
    permissionError: string | null
}

@connect(state => ({
    data: state.data,
}))
@logged
export default class BrowseItemPagePlaces extends React.Component<SMP, SMS> {


    motor: ISearchMotor
    positionSelector: IPositionSelector

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
                algoliaFilter: makeBrowseAlgoliaFilter2('me', 'places', this.getUser()),
                permissionError: 'not-asked',
            },
            search: {
                search: __createAlgoliaSearcher({
                    index: index,
                    geoSearch: true,
                    parseResponse: (hits) => createResultFromHit(hits, {}, true),
                }),
                missingSearchPermissions: searchOptions => {
                    if (!searchOptions.permissionError && searchOptions.lat && searchOptions.lng) return null

                    return renderAskPermission(searchOptions.permissionError, (status) => this.setState({searchOptions: {...this.state.searchOptions, ...status}}))
                }
            }
        }
    }

    render() {
        const mapDisplay = this.state.mapDisplay
        return (
            <View style={{flex: 1}}>
                <SocialScopeSelector onScopeChange={scope => {
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
                    searchEngine={this.state.search}
                    renderResults={this._renderResults}
                    searchOptions={this.state.searchOptions}
                    ref={ref => this.motor = ref}
                    // renderBlank={cannot => {
                    //     if (cannot === 'location_permissions_undetermined') {
                    //         return (
                    //             <View>
                    //                 <Text>#please give the permissions</Text>
                    //                 <Button
                    //                     title="#ask permissions"
                    //                     onPress={async () => {
                    //                         console.info("asking for location permissions result")
                    //                         let res = await Permissions.request('location')
                    //                         console.info("location permissions result", res)
                    //                         if (res === 'authorized') {
                    //                             let position = await this.positionSelector.getPosition()
                    //                             let {lat, lng} = position
                    //                             this.setState({searchOptions: {...this.state.searchOptions, lat, lng}})
                    //                         }
                    //                         else {
                    //                             console.warn("location permissions result case not handled", res)
                    //                             //what to do, what to do
                    //                         }
                    //
                    //                     }}
                    //                 />
                    //             </View>
                    //         )
                    //
                    //     }
                    //     return <View><Text>{cannot}</Text></View>
                    // }}
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
        if (this.state.mapDisplay) return <GMap searchState={state} onItemPressed={(item) => seeActivityDetails(this.props.navigator, item)}/>
        else return <SearchListResults searchState={state} renderItem={renderItem.bind(this)}/>
    }



    //TODO: use selector
    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
