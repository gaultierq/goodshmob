//@flow
import React, {Component} from 'react'
import {ActivityIndicator, Image, Text, View} from 'react-native'
import MapView, {Callout, Marker} from 'react-native-maps'
import memoize from "memoize-one"
import type {Item} from "../../types"


export type Props = {
    setRef?: any => void,
    onItemPressed: (item: any) => void,
    onRegionChange?: Region => void,
    EmptyComponent?: () => any,
    points: Item[],
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


export default class GMap extends Component<Props, State>  {

    getCenter = memoize(data => GMap.getCenter(data))
    getData = memoize(data => _.flatten(data))
    center: Region

    map;
    animateCount = 0

    componentDidUpdate(prevProps: Props) {
        if (this.props.points !== prevProps.points) {
            if (++ this.animateCount === 1) {
                this.animateToPoints()
            }
        }
    }

    render() {

        const {setRef, points, ...attr} = this.props


        return (
            <MapView
                ref={map => {
                    this.map = map
                    if (setRef) setRef(map)
                }}
                style={{flex:1}}
                provider={'google'}
                showsUserLocation={true}
                {...attr}
            >
                {points && points.map(this._renderMarker)}
            </MapView>
        )
    }

    animateToPoints() {
        setTimeout(() => {
            if (this.map) {
                // this.map.fitToSuppliedMarkers(this.props.points.map((p, i) => i), {
                //     animated: true, edgePadding: {
                //         top: 10,
                //         right: 10,
                //         bottom: 10,
                //         left: 10,
                //     }})

                this.map.fitToElements(true)
            }
        }, 1000)
    }

    static getCenter(data: []): ?Region {
        if (_.isEmpty(data)) {
            return null
        }

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

    _renderMarker = (result: *, key: number) => {
        //Q to E: un peu strange ca; add a type for result ?
        const item = result.resource || result

        //Q to E: MagicString
        const userInfo = result.user ? ` by ${result.user.first_name} ${result.user.last_name}` : ''
        const title = `${item.title}${userInfo}`
        const description = item.description.address

        return <Marker key={key}
                       coordinate={item.description}>
            {/*Button in callout are not possible on Android, must make the full view clickable*/}
            <Callout onPress={() => this.props.onItemPressed(result)}>
                <View style={{width: 200}}>
                    <Text style={{fontWeight: 'bold'}}>{title}</Text>
                    <Text>{description}</Text>
                    <Text>{i18n.t("search.category.more_details")}</Text>
                </View>
            </Callout>
        </Marker>
    }

}

//use me
export function getRegionForCoordinates(points) {
    // points should be an array of { latitude: X, longitude: Y }
    let minX, maxX, minY, maxY;

    // init first point
    ((point) => {
        minX = point.latitude;
        maxX = point.latitude;
        minY = point.longitude;
        maxY = point.longitude;
    })(points[0]);

    // calculate rect
    points.map((point) => {
        minX = Math.min(minX, point.latitude);
        maxX = Math.max(maxX, point.latitude);
        minY = Math.min(minY, point.longitude);
        maxY = Math.max(maxY, point.longitude);
    });

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const deltaX = (maxX - minX);
    const deltaY = (maxY - minY);

    return {
        latitude: midX,
        longitude: midY,
        latitudeDelta: deltaX,
        longitudeDelta: deltaY
    };
}

export function regionFrom2({latitude, longitude}, distance) {
    return regionFrom(latitude, longitude, distance)
}
export function regionFrom(lat, lng, distance) {
    if (!_.isNumber(lat) || !_.isNumber(lng) || !_.isNumber(distance)) return null

    const latitudeDelta = distance / (111.32 * 1000);
    const longitudeDelta = distance / (111.32 * 1000 * Math.cos(lat * (Math.PI / 180)));

    return {
        latitude: lat,
        longitude: lng,
        latitudeDelta,
        longitudeDelta,
    }
}

export function mFromLatDelta(latitudeDelta: number) {
    return 111.32 * 1000 * latitudeDelta
}

export function mFromLngDelta(latitude: number, longitudeDelta: number) {
    return 111.32 * 1000 * Math.cos(latitude* (Math.PI / 180)) * longitudeDelta
}


