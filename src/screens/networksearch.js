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
import AlgoliaSearchScreen from "./algoliasearch";
import ItemCell from "./components/ItemCell";
import LineupCell from "./components/LineupCell";
import * as Nav from "./Nav";
import {createResultFromHit, createResultFromHit2} from "../utils/AlgoliaUtils";
import UserConnectItem from "./userConnectItem";

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
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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
                return (
                    <TouchableWithoutFeedback
                        onPress={this.onLineupPressed.bind(this)}>
                        <View>
                            <LineupCell lineup={item}/>
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

        let categories = [
            {
                type: "savings",
                query: {
                    indexName: 'Saving_staging',
                    params: {
                        facets: "[\"list_name\"]",
                    }

                },
                tabName: "network_search_tabs.savings",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit,
                renderItem,
            },
            {
                type: "users",
                query: {
                    indexName: 'User_staging',
                    params: {
                        //facets: "[\"list_name\"]",
                        //filters: 'user_id:' + currentUserId(),
                    }

                },
                tabName: "network_search_tabs.users",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit2,
                renderItem: renderUser,
            },

        ];

        let navigator = this.props.navigator;
        return (
            <AlgoliaSearchScreen
                categories={categories}
                navigator={navigator}
            />
        );
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

