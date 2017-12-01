// @flow

import React, {Component} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {connect} from "react-redux";
import type {Id, List, NavigableProps, Saving} from "../types";
import ItemCell from "./components/ItemCell";
import LineupCell from "./components/LineupCell";
import * as Nav from "./Nav";
import {createResultFromHit, createResultFromHit2, makeAlgoliaSearch} from "../utils/AlgoliaUtils";
import UserConnectItem from "./userConnectItem";
import UserRowI from "../activity/components/UserRowI";
import {Colors} from "./UIStyles";
import algoliasearch from 'algoliasearch/reactnative';
import {currentUserId} from "../CurrentUser";


type Props = NavigableProps & {
    onClickClose?: () => void,
};

type State = {
    connect: {[Id]: number}
};

@connect()
export default class NetworkSearchScreen extends Component<Props, State> {

    state :State = {connect: {}};

    constructor(props) {
        super(props);
        props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id === Nav.CANCEL) { // this is the same id field from the static navigatorButtons definition
                this.props.onClickClose();
            }
        }
    }

    render() {


        let renderItem = ({item})=> {

            let isLineup = item.type === 'lists';


            if (isLineup) {
                let user = item.user;

                let userXml = (
                    <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontSize: 12, color: Colors.grey1, marginLeft: 8, marginRight: 3}}>- by</Text>
                        <UserRowI
                            user={user}
                            navigator={this.props.navigator}
                            style={{flex:1, }}
                        />
                    </View>);

                return (
                    <TouchableWithoutFeedback
                        onPress={() => this.onLineupPressed(item)}>
                        <View>
                            <LineupCell
                                lineup={item}
                                titleChildren={userXml}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                )
            }
            else {
                let saving = item;

                let resource = saving.resource;

                //TODO: this is hack
                if (!resource) return null;

                return (
                    <ItemCell
                        item={resource}
                        onPressItem={()=>this.onSavingPressed(saving)}
                    />
                )
            }
        };

        let renderUser = ({item}) => {
            return (
                <UserConnectItem user={item}/>
            );
        };

        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");

        let index = client.initIndex('Saving_staging');
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
                index: client.initIndex('User_staging'),
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

        return makeAlgoliaSearch(categories, navigator);
    }


    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
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

