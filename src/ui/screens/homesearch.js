// @flow

import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import type {Id, List, NavigableProps, Saving, SearchToken} from "../../types"
import ItemCell from "../components/ItemCell"
import {AlgoliaClient, createResultFromHit, makeAlgoliaSearchEngine} from "../../helpers/AlgoliaUtils"
import Screen from "../components/Screen"
import type {SearchCategory} from "./search"
import SearchScreen from "./search"
import GTouchable from "../GTouchable"
import Config from 'react-native-config'
import SearchPage from "./SearchPage"
import {renderLineupFromOtherPeople} from "../UIComponents"
import EmptySearch from "../components/EmptySearch"
import {Colors} from "../colors"

type Props = NavigableProps & {
    token?:SearchToken,
};

type State = {
};

@connect()
@logged
export default class HomeSearchScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    render() {
        let renderItem = ({item})=> {
            let isLineup = item.type === 'lists';

            //FIXME: item can be from search, and not yet in redux store
            //item = buildData(this.props.data, item.type, item.id) || item;

            //if (!item) return null;

            if (isLineup) {

                let lineup: List = item;
                return renderLineupFromOtherPeople(this.props.navigator, lineup)
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


        let index = new Promise(resolve => {
            AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
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
                query,
                placeholder: "search_bar.me_placeholder",
                parseResponse: createResultFromHit,
                renderResults: ({query, searchState}) => {
                    if (!searchState || _.isEmpty(searchState.data)) {
                        return <EmptySearch text={i18n.t("lineups.search.empty")}/>
                    }
                    return (
                        <SearchPage
                            query={query}
                            search={searchState}
                            renderItem={renderItem}
                        />
                    )
                }
            }
        ];
        let navigator = this.props.navigator;
        let search = makeAlgoliaSearchEngine(categories, navigator);

        return (
            <SearchScreen
                searchEngine={search}
                categories={categories}
                navigator={navigator}
                token={this.props.token}
                placeholder={i18n.t('search.in_feed')}
                style={{backgroundColor: Colors.white}}
            />
        );
    }

    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            passProps: {activityId: saving.id, activityType: saving.type}, // Object that will be passed as props to the pushed screen (optional)
        });
    }
}
