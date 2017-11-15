// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, TouchableWithoutFeedback, View} from 'react-native';
import {connect} from "react-redux";
import type {List, NavigableProps, Saving} from "../types";
import AlgoliaSearchScreen from "./algoliasearch";
import ItemCell from "./components/ItemCell";
import LineupCell from "./components/LineupCell";
import {currentUserId} from "../CurrentUser";
import * as Nav from "./Nav";
import UserRow from "../activity/components/UserRow";
import {createResultFromHit, createResultFromHit2} from "../utils/AlgoliaUtils";


type Props = NavigableProps & {
    onClickClose?: () => void,
};

type State = {
};

@connect()
export default class NetworkSearchScreen extends Component<Props, State> {

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

        //this.setState({isSearching: true});
        const queries = [
            {
                indexName: 'Saving_development',
                params: {
                    facets: "[\"list_name\"]",
                    filters: 'user_id:' + currentUserId(),
                }
            }
        ];


        let renderItem = ({item})=> {

            let isLineup = item.type === 'lists';

            //FIXME: item can be from search, and not yet in redux store
            //item = buildData(this.props.data, item.type, item.id) || item;

            //if (!item) return null;

            if (isLineup) {
                return (
                    <TouchableWithoutFeedback
                        onPress={this.onLineupPressed}>
                        <View>
                            <LineupCell
                                lineup={item}
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
                <UserRow user={item}
                         navigator={this.props.navigator}
                />
            );
        };

        let categories = [
            {
                type: "savings",
                query: {
                    indexName: 'Saving_development',
                    params: {
                        facets: "[\"list_name\"]",
                        //filters: 'user_id:' + currentUserId(),
                    }

                },
                tabName: "network_search_tabs.savings",
                parseResponse: createResultFromHit,
                renderItem,
            },
            {
                type: "users",
                query: {
                    indexName: 'User_development',
                    params: {
                        //facets: "[\"list_name\"]",
                        //filters: 'user_id:' + currentUserId(),
                    }

                },
                tabName: "network_search_tabs.users",
                parseResponse: createResultFromHit2,
                renderItem: renderUser,
            },

        ];

        let navigator = this.props.navigator;
        return (
            <AlgoliaSearchScreen
                categories={categories}
                placeholder={"search_bar.network_placeholder"}
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
            screen: 'goodsh.SavingsScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }

}

