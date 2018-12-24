//@flow
import React, {Component} from 'react'
import {ActivityIndicator, Image, Text, View} from 'react-native'
import MapView, {Callout, Marker} from 'react-native-maps'
import type {SearchState} from "../../helpers/SearchHelper"
import memoize from "memoize-one"
import {Colors} from "../colors"
import GMap from "./GMap"


export type Props = {
    searchState: SearchState,
    setRef?: () => void,
    onItemPressed: (item: any) => void,
    onRegionChange?: Region => void,
    EmptyComponent?: () => any
};

type State = {
    // region: ?Region, //user set region
}

export type Region = {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
}


export default class SearchMap extends Component<Props, State>  {

    getCenter = memoize(data => GMap.getCenter(data))
    getData = memoize(data => _.flatten(data))
    center: Region


    render() {

        const {...attr} = this.props

        const requestState = _.get(this.props, 'searchState.requestState', [])

        const data = this.getData(_.get(this.props, 'searchState.data', []))


        return (
            <View style={{flex:1}}>
                <GMap {...attr} points={data} />
                {requestState === 'sending' && <ActivityIndicator
                    animating={true}
                    size="large"
                    style={{position: 'absolute', bottom: 30, left: 20}}
                />
                }
                {requestState === 'ok' && data.length === 0 && this.props.EmptyComponent()}
            </View>
        )
    }
}
