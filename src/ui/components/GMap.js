//@flow
import React, {Component} from 'react'
import {Image} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import type {SearchCategory, SearchState} from "../../helpers/SearchHelper"

export type Props = {
    category: SearchCategory,
    searchState: SearchState
};

type State = {
};


export default class GMap extends Component<Props, State>  {

    static defaultProps = {

    };

    render() {
        const data = _.flatten(this.props.searchState.data)
        return (<MapView
            style={{flex:1, marginTop: 5}}
            initialRegion={{
                latitude: 48.8600141,
                longitude: 2.3509759,
                latitudeDelta: 0.1822,
                longitudeDelta: 0.0821,
            }}>

            {data && data.map(function (result, i) {
                return <Marker key={i}
                               coordinate={result.resource.description}
                               title={`${result.resource.title} by ${result.user.first_name} ${result.user.last_name}`}
                               description={result.resource.description.address}
                />
            })}
        </MapView>
        );
    }

}

