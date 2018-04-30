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
import type {Id, Lineup, List, NavigableProps, Saving} from "../../types";
import ItemCell from "../components/ItemCell";
import LineupCell from "../components/LineupCell";
import {AlgoliaClient, createResultFromHit, createResultFromHit2, makeAlgoliaSearchEngine} from "../../helpers/AlgoliaUtils";
import UserConnectItem from "./userConnectItem";
import UserRowI from "../activity/components/UserRowI";
import {SearchStyles} from "../UIStyles";
import Screen from "../components/Screen";
import Config from 'react-native-config'
import SearchScreen from "./search";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import {seeActivityDetails, seeList, seeUser} from "../Nav";
import LineupHorizontal, {LineupH1} from "../components/LineupHorizontal";
import LineupTitle from "../components/LineupTitle";
import type {SearchState} from "./search";
import SearchPage from "./SearchPage";

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


    static navigatorStyle = SearchStyles;

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
                renderResults: ({query: SearchQuery, searchResults: SearchState}) => (
                    <SearchPage
                        search={searchResults}
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


//TODO: move
export let renderLineupFromAlgolia = (navigator, item) => {
    let user = item.user;


    let userXml = (


        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 0,
            // backgroundColor: 'yellow'
        }}>
            <Text style={{
                fontSize: 12,
                color: Colors.greyishBrown,
                marginLeft: 8,
                marginRight: 3,
                flex: 0,

            }}>{i18n.t('search.by')}</Text>
            <UserRowI
                user={user}
                navigator={navigator}
                noImage={true}
                style={{flex: 0}} //TODO: rm when removed in UserRowI
            />
        </View>
    );

    const newVar = <GTouchable
        onPress={() => seeList(navigator, item)}>

        <LineupHorizontal
            lineupId={item.id}
            dataResolver={() => ({lineup: item, savings: item.savings})}
            style={{paddingBottom: 10}}
            renderTitle={(lineup: Lineup) => (
                <View style={{flexDirection: 'row'}}>
                    <LineupTitle lineup={lineup} style={{marginVertical: 6,}}/>
                    {userXml}
                </View>
            )}
        />
    </GTouchable>;
    return newVar;
};
let itemRenderer = navigator => {
    let renderItem = ({item}) => {

        let isLineup = item.type === 'lists';


        if (isLineup) {
            return renderLineupFromAlgolia(navigator, item)
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
