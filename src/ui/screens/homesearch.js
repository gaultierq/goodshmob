// @flow

import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {connect} from "react-redux";
import type {Id, List, NavigableProps, Saving} from "../../types";
import ItemCell from "../components/ItemCell";
import LineupCell from "../components/LineupCell";
import {AlgoliaClient, createResultFromHit, makeAlgoliaSearch} from "../../helpers/AlgoliaUtils";
import {currentUserId} from "../../managers/CurrentUser";
import Screen from "../components/Screen";
import type {SearchCategory} from "./search";
import SearchScreen from "./search";
import {SearchStyles} from "../UIStyles";

type Props = NavigableProps & {
};

type State = {
    connect: {[Id]: number}
};

@connect()
export default class HomeSearchScreen extends Screen<Props, State> {

    state :State = {connect: {}};

    static navigatorStyle = SearchStyles;

    render() {
        let renderItem = ({item})=> {
            let isLineup = item.type === 'lists';

            //FIXME: item can be from search, and not yet in redux store
            //item = buildData(this.props.data, item.type, item.id) || item;

            //if (!item) return null;

            if (isLineup) {
                let lineup: List = item;
                return (
                    <TouchableOpacity
                        onPress={() => this.onLineupPressed(lineup)}
                    >
                        <View>
                            <LineupCell lineup={lineup}/>
                        </View>
                    </TouchableOpacity>
                )
            }
            else {
                let saving = item;

                let resource = saving.resource;

                //TODO: this is hack
                if (!resource) return null;

                return (
                    <TouchableOpacity onPress={()=>this.onSavingPressed(saving)}>
                        <ItemCell item={resource}/>
                    </TouchableOpacity>

                )
            }
        };


        let index = new Promise(resolve => {
            AlgoliaClient.createAlgoliaIndex('Saving_staging').then(index => {
                index.setSettings({
                        searchableAttributes: [
                            'item_title',
                            'list_name'
                        ],
                        attributesForFaceting: ['user_id'],
                    }
                );
                resolve(index);
            });
        });


        let query = {
            filters: `user_id:${currentUserId()}`,
        };

        let categories : Array<SearchCategory> = [
            {
                type: "savings",
                index,
                query/*: {
                    indexName: 'Saving_staging',
                    params: {
                        facets: "[\"list_name\"]",
                        filters: 'user_id:' + currentUserId(),
                    }
                }*/,
                placeholder: "search_bar.me_placeholder",
                parseResponse: createResultFromHit,
                renderItem,
            }
        ];

        let navigator = this.props.navigator;
        // return (
        //     <AlgoliaSearchScreen
        //         categories={categories}
        //         navigator={navigator}
        //     />
        // );
        let search = makeAlgoliaSearch(categories, navigator);

        return (
            <SearchScreen
                searchEngine={{search}}
                categories={categories}
                navigator={navigator}
            />
        );
    }

    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "#Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../../img2/headerLogoBlack.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {activityId: saving.id, activityType: saving.type}, // Object that will be passed as props to the pushed screen (optional)
        });
    }

    onLineupPressed(lineup: List) {
        this.props.navigator.push({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }
}

