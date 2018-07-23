//@flow
import React, {Component} from 'react'
import {ActivityIndicator, Image, View, Text} from 'react-native'
import MapView, {Marker, Callout} from 'react-native-maps'
import type {SearchState} from "../../helpers/SearchHelper"
import {Activity} from "../../types"
import {renderSimpleButton} from "../UIStyles"
import {seeActivityDetails} from "../Nav"

export type Props = {
    searchState: SearchState,
    setRef?: () => void,
    onItemPressed: (item: any) => void
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

    renderMarker(key: number, result: any) {
        const item = result.resource || result
        const userInfo = result.user ? ` by ${result.user.first_name} ${result.user.last_name}` : ''
        const title = `${item.title}${userInfo}`
        const description = item.description.address

        return <Marker key={key}
                       coordinate={item.description}>
            {/*Button in callout are not possible on Android, must make the full view clickable*/}
            <Callout onPress={() => this.props.onItemPressed(result)}>
                <View>
                    <Text style={{fontWeight: 'bold'}}>{title}</Text>
                    <Text>{description}</Text>
                    <Text>{i18n.t("search.category.more_details")}</Text>
                </View>
            </Callout>
        </Marker>
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
                    {data && data.map((result, i) => {
                        return this.renderMarker(i, result)
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

