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
import LineupCell from "../components/LineupCell";
import {AlgoliaClient, createResultFromHit, createResultFromHit2, makeAlgoliaSearch} from "../../helpers/AlgoliaUtils";
import UserConnectItem from "./userConnectItem";
import UserRowI from "../activity/components/UserRowI";
import {SearchStyles} from "../UIStyles";
import Screen from "../components/Screen";
import Config from 'react-native-config'
import SearchScreen from "./search";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";

type Props = NavigableProps & {
};

type State = {
    connect: {[Id]: number}
};

@connect()
@logged
export default class NetworkSearchScreen extends Screen<Props, State> {


    static navigatorStyle = SearchStyles;

    state: State = {connect: {}};

    render() {


        let renderItem = ({item})=> {

            let isLineup = item.type === 'lists';


            if (isLineup) {
                let user = item.user;


                let userXml = (
                    <View  style={{flex:1}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8}}>
                            <Text style={{fontSize: 12, color: Colors.greyishBrown, marginLeft: 8, marginRight: 3}}>by</Text>
                            <UserRowI
                                user={item.user}
                                navigator={this.props.navigator}
                                noImage={true}
                            />
                        </View>
                    </View>
                );

                return (
                    <GTouchable
                        onPress={() => this.onLineupPressed(item)}>
                        <View>
                            <LineupCell
                                lineup={item}
                                titleChildren={userXml}
                                titleChildrenBelow={true}
                            />
                        </View>
                    </GTouchable>
                )
            }
            else {
                let saving = item;

                let resource = saving.resource;

                //TODO: this is hack
                if (!resource) return null;

                return (
                    <GTouchable onPress={()=>this.onSavingPressed(saving)}>
                        <ItemCell item={resource}/>
                    </GTouchable>
                )
            }
        };

        let renderUser = ({item}) => {
            return (
                <UserConnectItem
                    user={item}
                    navigator={this.props.navigator}
                />
            );
        };

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
                renderItem,
            },
            {
                type: "users",
                index: AlgoliaClient.createAlgoliaIndex('User_staging'),
                //index: client.initIndex('User_staging'),
                query: {
                    filters: `NOT objectID:${currentUserId()}`,

                },
                tabName: "network_search_tabs.users",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit2,
                renderItem: renderUser,
            },

        ];

        let navigator = this.props.navigator;
        // return (
        //     <AlgoliaSearchScreen
        //         categories={categories}
        //         navigator={navigator}
        //     />
        // );

        let search = makeAlgoliaSearch(categories, navigator);

        return <SearchScreen
            searchEngine={{search}}
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
