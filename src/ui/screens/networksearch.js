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
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Id, List, NavigableProps, Saving} from "../../types";
import ItemCell from "../components/ItemCell";
import {
    AlgoliaClient,
    createResultFromHit,
    createResultFromHit2,
    makeAlgoliaSearchEngine
} from "../../helpers/AlgoliaUtils";
import UserConnectItem from "./userConnectItem";
import {SearchStyles} from "../UIStyles";
import Screen from "../components/Screen";
import Config from 'react-native-config'
import SearchScreen from "./search";
import GTouchable from "../GTouchable";
import {seeActivityDetails, seeUser} from "../Nav";
import SearchPage from "./SearchPage";
import {renderLineupFromOtherPeople} from "../UIComponents";
import {Colors} from "../colors"

type Props = NavigableProps & {
};

type State = {
    connect: {[Id]: number}
};

@connect()
@logged
export default class NetworkSearchScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };


    state: State = {connect: {}};

    render() {

        let navigator = this.props.navigator;

        let {renderItem, renderUser} = itemRenderer(navigator);

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

        let query = {
            filters: `NOT type:List AND NOT user_id:${currentUserId()}`,
        };

        let categories = [
            {
                type: "savings",
                index,
                query,
                tabName: "network_search_tabs.savings",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit,
                renderResults: ({query, results}) => (
                    <SearchPage
                        search={results}
                        renderItem={renderItem}
                    />
                )
            },
            {
                type: "users",
                index: AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_USER_INDEX),
                query: {
                    filters: `NOT objectID:${currentUserId()}`,

                },
                tabName: "network_search_tabs.users",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit2,
                renderResults: ({query, results}) => (
                    <SearchPage
                        search={results}
                        renderItem={renderUser}
                    />
                )
            },

        ];

        let search = makeAlgoliaSearchEngine(categories, navigator);

        return <SearchScreen
            searchEngine={search}
            categories={categories}
            navigator={navigator}
            placeholder={i18n.t('search.in_network')}
            style={{backgroundColor: Colors.white}}
        />;
    }


    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
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



let itemRenderer = navigator => {
    let renderItem = ({item}) => {

        let isLineup = item.type === 'lists';


        if (isLineup) {
            return renderLineupFromOtherPeople(navigator, item)
        }
        else {
            let saving = item;

            let resource = saving.resource;

            //TODO: this is hack
            if (!resource) return null;

            return (
                <GTouchable onPress={() => seeActivityDetails(navigator, saving)}>
                    <ItemCell item={resource}/>
                </GTouchable>
            )
        }
    };

    let renderUser = ({item}) => {
        return (
            <GTouchable onPress={() => seeUser(navigator, item)}>
                <UserConnectItem
                    user={item}
                    navigator={navigator}
                />
            </GTouchable>
        );
    };
    return {renderItem, renderUser};
};
