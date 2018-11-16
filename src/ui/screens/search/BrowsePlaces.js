// @flow

import type {Node} from 'react'
import React from 'react'
import {Button, StyleSheet, Text, TextInput, View,} from 'react-native'
import type {FRIEND_FILTER_TYPE, SearchEngine, SearchState} from "../../../helpers/SearchHelper"
import {
    __createAlgoliaSearcher,
    makeBrowseAlgoliaFilter2,
    PERMISSION_EMPTY_POSITION, renderEmptyResults,
    renderSaving
} from "../../../helpers/SearchHelper"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import type {ISearchMotor} from "../searchMotor"
import SearchMotor from "../searchMotor"
import {currentUserId, logged} from "../../../managers/CurrentUser"
import {buildData} from "../../../helpers/DataUtils"
import {connect} from "react-redux"
import {AlgoliaClient, createResultFromHit} from "../../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import {SocialScopeSelector} from "./socialscopeselector"
import type {GeoStatus, IPositionSelector} from "./searchplacesoption"
import {renderAskPermission, SearchPlacesOption} from "./searchplacesoption"
import type {RNNNavigator} from "../../../types"
import SearchListResults from "../searchListResults"
import type {Region} from "../../components/GMap"
import GMap, {mFromLatDelta, mFromLngDelta, regionFrom} from "../../components/GMap"
import {Colors} from "../../colors"
import ActionButton from "react-native-action-button"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import {seeActivityDetails} from "../../Nav"
import {GoodshContext, registerLayoutAnimation, scheduleOpacityAnimation} from "../../UIComponents"
import GTouchable from "../../GTouchable"
import {hexToRgbaWithHalpha} from "../../../helpers/DebugUtils"
import {flatDiff} from "../../../helpers/StringUtils"


type SMS = {
    searchOptions?: BrowseItemsPlacesOptions,
    mapDisplay: boolean,
    scope: FRIEND_FILTER_TYPE,
    displayRefreshButton?: boolean
}

type SMP = ?GeoStatus & {
    navigator: RNNNavigator,
    focused?: boolean,
    scope: FRIEND_FILTER_TYPE,
    mapDisplay?: boolean
}

export type BrowseItemsGenOptions = {
    algoliaFilter?: string,
}

export type BrowseItemsPlacesOptions = BrowseItemsGenOptions & GeoStatus

const DEFAULT_RAD = 5000


@connect(state => ({
    data: state.data,
}))
@logged
export default class BrowsePlaces extends React.Component<SMP, SMS> {

    searchMotor: ISearchMotor<BrowseItemsPlacesOptions>
    positionSelector: IPositionSelector
    logger = rootlogger.createLogger('browse places')

    static defaultProps = {scope: 'me', mapDisplay: true}

    constructor(props: SMP) {
        super(props)
        let {navigator, data, ...p} = props
        this.logger.debug('construct', p)
        this.state = {
            mapDisplay: props.mapDisplay,
            searchOptions: {
                algoliaFilter: makeBrowseAlgoliaFilter2('me', 'places', this.getUser()),
                permissionError: PERMISSION_EMPTY_POSITION,
            },
            scope: props.scope,
            // displayRefreshButton: true
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
        const {navigator, data, ...props} = this.props
        this.logger.debug('render', props, this.state)
        const mapDisplay = this.state.mapDisplay
        return (
            <View style={{flex: 1}}>
                <SocialScopeSelector
                    initialValue={props.scope}
                    onScopeChange={scope => {
                        this.setState({
                            searchOptions: {
                                ...this.state.searchOptions,
                                algoliaFilter: makeBrowseAlgoliaFilter2(scope, 'places', this.getUser())
                            },
                            scope,
                        })}
                    }
                    value={this.state.scope}
                />

                <SearchPlacesOption
                    innerRef={ref => this.positionSelector = ref}
                    navigator={this.props.navigator}
                    onNewOptions={(pos: GeoStatus) => {
                        this.logger.debug("::onNewOptions::", pos)

                        //what to do ?

                        pos = {...pos, radius: DEFAULT_RAD}

                        this.setState({searchOptions: {...this.state.searchOptions, ...pos}})
                    }}
                />

                <GoodshContext.Provider value={{userOwnResources: this.state.scope === 'me'}}>

                    <SearchMotor
                        searchEngine={this.search}
                        renderResults={this._renderResults}
                        searchOptions={this.state.searchOptions}
                        innerRef={ref => this.searchMotor = ref}
                        canSearch={this._canSearch}
                        renderMissingPermission={this._renderMissingPermission}
                    />

                </GoodshContext.Provider>

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

    region: Region

    _renderResults = (state: SearchState) => {
        if (this.state.mapDisplay) {
            const region: ?Region = this.getRegion()

            return (
                <View style={{flex:1}}>
                    {
                        this.state.displayRefreshButton && (
                            <View style={{
                                flex:1,
                                position: 'absolute',
                                zIndex: 1000,
                                width: "100%",
                                paddingTop: 20,
                                paddingHorizontal: "10%",

                            }}>
                                <GTouchable
                                    style={{
                                        flex: 1,
                                        width: "100%",
                                        backgroundColor: hexToRgbaWithHalpha(Colors.darkOrange, 0.8),
                                        borderRadius: 20,
                                        height: 40,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onPress={()=>{

                                        let radius = Math.round(
                                            Math.max(
                                                mFromLatDelta(this.region.latitudeDelta),
                                                mFromLngDelta(this.region.latitude, this.region.longitudeDelta)
                                            )
                                        )

                                        //pour algolia
                                        let pos = {
                                            lat: this.region.latitude,
                                            lng: this.region.longitude,
                                            radius: radius
                                        }


                                        this.setState({
                                                searchOptions: {
                                                    ...this.state.searchOptions,
                                                    ...pos
                                                },
                                                displayRefreshButton: false,
                                            }
                                        )
                                    }}
                                >
                                    <Text style={{
                                        paddingHorizontal: 20,
                                        color: Colors.white,
                                        alignSelf: 'center'}}>
                                        {i18n.t('search_here')}
                                    </Text>
                                </GTouchable>


                            </View>)
                    }
                    <GMap
                        searchState={state}
                        onItemPressed={(item) => seeActivityDetails(this.props.navigator, item)}
                        initialRegion={region}
                        showsUserLocation={true}
                        onRegionChange={reg => {
                            // logger.debug(`region = `, reg)
                            this.region = reg
                            //doesnt work on translation...
                            // let ar0 = region.latitudeDelta * region.longitudeDelta
                            // let ar1 = reg.latitudeDelta * reg.longitudeDelta
                            this.setState({displayRefreshButton: true})
                            scheduleOpacityAnimation()

                        }}
                    />
                </View>
            )
        }

        else return (
            <SearchListResults
                searchState={state}
                renderItem={this._renderSaving}
                EmptyComponent={renderEmptyResults(this.state.scope, 'places', this.props.navigator)}
            />
        )
    }

    _renderSaving = (item) => renderSaving(item, this.props.navigator)

    getRegion() {
        if (this.state.searchOptions) {
            let {lat, lng, radius} = this.state.searchOptions
            return regionFrom(lat, lng, radius)
        }
        return null
    }

    //https://www.reddit.com/r/reactjs/comments/93r7je/how_to_update_state_when_prop_changes/
    componentDidUpdate(prevProps: SMP) {

        let nl = p => {
            let {navigator, data, ...pp} = p
            return pp
        }
        this.logger.debug('componentDidUpdate', nl(this.props), nl(prevProps))
        // for "don't search on 1st render" feature
        if (prevProps.focused !== this.props.focused) {
            //disapointing
            setTimeout(() => {
                if (this.searchMotor) this.searchMotor.search(this.state.searchOptions, false)
            })
        }
        let partialSO = null

        let set = (k,v) => {
            partialSO = _.set(partialSO || {}, k, v)
            this.logger.debug('debug:: set', k, v, partialSO)
        }

        if (prevProps.scope !== this.props.scope) {
            this.setState({scope: this.props.scope})
            set('algoliaFilter', makeBrowseAlgoliaFilter2(this.props.scope, 'places', this.getUser()))
        }

        let mutSearchOpt = (a: string)  => {
            if (prevProps[a] !== this.props[a]) {
                set(a, this.props[a])
            }
        }
        ['lat', 'lng', 'radius'].forEach(o => mutSearchOpt(o))
        if (partialSO) {
            this.logger.debug('update from props', partialSO)
            this.setState({searchOptions: {...this.state.searchOptions, ...partialSO}})
        }

    }

    //TODO: use selector
    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }
}
