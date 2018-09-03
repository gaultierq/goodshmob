// @flow
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {Navigation} from "react-native-navigation"
import GTouchable from "../GTouchable"
import MapView, {Marker} from 'react-native-maps'
import {AlgoliaClient} from "../../helpers/AlgoliaUtils"
import Config from 'react-native-config'
import SearchUserPage from "./search/SearchUserPage"
import BrowsePlaces from "./search/BrowsePlaces"

type Props = {
};

type State = {
};


export default class TestScreen extends Component<Props, State> {


    // static navigatorStyle = {
    //     navBarHidden: true,
    // };


    state = {}
    constructor(props: Props){
        super(props);
        let indexResolver = new Promise(resolve => {
            AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
                index.setSettings({
                        searchableAttributes: [
                            'item_title',
                            'list_name'
                        ],
                        attributesForFaceting: ['user_id', 'type'],
                    }
                );
                resolve(index);
            });
        })

        const query = {
            "filters": "type:Place",
            "page": 0,
            "query": ""
        }
        console.log('query', query)
        indexResolver.then((index) => {
            index.search(query, (err, content) => {
                if (err) {
                    console.log('error', err)
                }
                let res = {};
                let result = content;
                let hits = result.hits;
                this.setState({results: result.hits})
                console.log('results', hits)
            })
        })

    }


    render() {
        return <MapView
            style={{flex:1}}
            initialRegion={{
                latitude: 48.8600141,
                longitude: 2.3509759,
                latitudeDelta: 0.1822,
                longitudeDelta: 0.0821,
            }}>
            {this.state.results && this.state.results.map(function (result) {
                return <Marker key={result.uid}
                               coordinate={result.description}
                               title={`${result.item_title} by ${result.user.first_name} ${result.user.last_name}`}
                               description={result.description.address}
                />
            })}
        </MapView>
    }

    render() {
        return <SearchUserPage />
    }

    render() {
        return <BrowsePlaces navigator={null} focused={true} mapDisplay={true} />
    }
}
