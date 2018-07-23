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


export default class GMap extends Component<Props, State>  {

    static defaultProps = {

    };

    render() {
        console.log('searchState', this.props.searchState)
        const requestState = _.get(this.props, 'searchState.requestState', [])

        const data = _.flatten(_.get(this.props, 'searchState.data', []))
        return (<View style={{flex:1, marginTop: 5}}>
                <MapView
                    style={{flex:1}}
                    provider={'google'}
                    ref={this.props.setRef}>
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

