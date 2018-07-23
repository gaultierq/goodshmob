//@flow
import React, {Component} from 'react'
import {ActivityIndicator, Image, View} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import type {SearchState} from "../../helpers/SearchHelper"

export type Props = {
    searchState: SearchState,
    setRef?: () => void
};

type State = {
};
type Region = {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
}


export default class GMap extends Component<Props, State>  {

    mapRef: Node
    center: Region

    static defaultProps = {

    };

    setRef(ref: Node) {
        if (ref != null) {
            this.mapRef = ref
        }
    }

    getCenter(data: []): Region {
        const latitudes = data.map((item) => {
            item = item.resource || item
            return item.description.latitude
        })
        const longitudes = data.map((item) => {
            item = item.resource || item
            return item.description.longitude
        })

        const maxLatitude = _.max(latitudes)
        const minLatitude = _.min(latitudes)
        const maxLongitude = _.max(longitudes)
        const minLongitude = _.min(longitudes)

        return {latitude: (maxLatitude + minLatitude) / 2,
            longitude: (maxLongitude + minLongitude) / 2,
            latitudeDelta: (maxLatitude - minLatitude) * 2,
            longitudeDelta: (maxLongitude - minLongitude) * 2}
    }

    render() {
        const requestState = _.get(this.props, 'searchState.requestState', [])

        const data = _.flatten(_.get(this.props, 'searchState.data', []))

        if (requestState === 'ok') {
            this.center = this.getCenter(data)
        }
        return (<View style={{flex:1, marginTop: 5}}>
                <MapView
                    style={{flex:1}}
                    provider={'google'}
                    region={this.center}
                    ref={this.setRef}>
                    {data && data.map(function (result, i) {

                        const item = result.resource || result
                        const userInfo = result.user ? ` by ${result.user.first_name} ${result.user.last_name}` : ''
                        return <Marker key={i}
                                       coordinate={item.description}
                                       title={`${item.title}${userInfo}`}
                                       description={item.description.address}
                        />
                    })}
                </MapView>
                {requestState === 'sending' && <ActivityIndicator
                    animating={true}
                    size="large"
                    style={{position: 'absolute', bottom: 30, left: 20}}
                />}
            </View>
        );
    }

}

