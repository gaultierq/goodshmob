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
import {currentUserId, logged, currentUser} from "../../managers/CurrentUser"
import type {Id, NavigableProps, Saving, SearchToken} from "../../types"
import ItemCell from "../components/ItemCell"
import {
    AlgoliaClient,
    createResultFromHit,
    makeAlgoliaSearchEngine
} from "../../helpers/AlgoliaUtils"
import Screen from "../components/Screen"
import MultiSwitch from "../components/MultiSwitch"
import EmptySearch, {renderBlankIcon} from "../components/EmptySearch"
import Config from 'react-native-config'
import SearchScreen from "./search"
import GTouchable from "../GTouchable"
import {seeActivityDetails} from "../Nav"
import {GoodshContext} from "../UIComponents"
import {SearchPlacesOption} from "./search/searchplacesoption"
import {Colors} from "../colors"
import {SEARCH_CATEGORIES_TYPE} from "../../helpers/SearchHelper"
import type {
    FRIEND_FILTER_TYPE, SearchOptions, SearchCategory
} from "../../helpers/SearchHelper"
import * as Api from "../../managers/Api"
import {
    actions as userActions,
    actionTypes as userActionTypes
} from "../../redux/UserActions"
import {buildData} from "../../helpers/DataUtils"

type Props = NavigableProps & {
    token ?: SearchToken
};

type State = {
    query: any
};

@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
@logged
export default class CategorySearchScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };


    state = {query: {
            filters: this.makeFilter('me'),
        }}


    componentDidMount() {
        //so I guess we are looking among the 1st 10 friends only ?
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUserAndTheirFriends(currentUserId()).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    getUser() {
        return buildData(this.props.data, "users", currentUserId())
    }

    renderItem({item}) {

        let saving = item;

        let resource = saving.resource;

        //TODO: this is hack
        if (!resource) return null;

        return (
            <GTouchable onPress={() => seeActivityDetails(this.props.navigator, saving)}>
                <ItemCell item={resource}/>
            </GTouchable>
        )
    }

    constructor(props: Props) {
        super(props);
    }

    render() {
        let navigator = this.props.navigator;
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

        let categories = SEARCH_CATEGORIES_TYPE.map(category => {
            return  {
                type: category,
                index,
                tabName: i18n.t("search_item_screen.tabs." + category),

                renderEmpty: <EmptySearch
                    icon={renderBlankIcon(category)}
                    text={i18n.t("search_item_screen.placeholder." + category)}

                />,
                renderItem: this.renderItem.bind(this),
                geoResult: category === 'places',
                parseResponse: (hits) => createResultFromHit(hits, {}, true),
                defaultOptions: {algoliaFilter: this.makeFilter('me', category)},
                renderOptions: this.renderOptions.bind(this),
            }
        })

        let search = makeAlgoliaSearchEngine(categories, navigator, true);

        return (

            <GoodshContext.Provider value={{
                // QG to EA: why ?
                userOwnResources: false
            }}>
                <SearchScreen
                    searchEngine={search}
                    categories={categories}
                    navigator={navigator}
                    style={{backgroundColor: Colors.white}}
                    hideSearchBar={true}

                    // QG to EA: ????!
                    token={'*'}
                />
            </GoodshContext.Provider>
        )
    }

    renderOptions (searchOptions: SearchOptions, onNewOptions: SearchOptions => void, category: SearchCategory) {

        const options = [
            {label: i18n.t("search.category.me"), type: 'me'},
            {label: i18n.t("search.category.friends"), type: 'friends'},
            {label: i18n.t("search.category.all"), type: 'all'},
        ]

        const onFriendFilterChange = (position: number) => {
            const friendFilter: FRIEND_FILTER_TYPE =  options[position].type

            searchOptions = _.clone(searchOptions)
            searchOptions.algoliaFilter = this.makeFilter(friendFilter, category.type)
            onNewOptions(searchOptions)
        }

        const onLocationChange = (newState) => {
            onNewOptions({...searchOptions, ...newState})
        }

        return <View>
            <MultiSwitch
                options={options}
                onPositionChange={onFriendFilterChange}/>
            {category.type === 'places' &&
            <SearchPlacesOption
                {...searchOptions}
                onNewOptions={onLocationChange}
                navigator={this.props.navigator}
            />
            }
        </View>

    }

    makeFilter(friendFilter: FRIEND_FILTER_TYPE, category: string): string {
        let CATEGORY_TO_TYPE = {
            consumer_goods: 'type:CreativeWork',
            places: 'type:Place',
            musics: '(type:Track OR type:Album OR type:Artist)',
            movies: '(type:Movie OR type:TvShow)'
        }
        const user = this.getUser()

        let defaultQuery = `${CATEGORY_TO_TYPE[category]}`
        switch(friendFilter) {
            case 'me':
                return `${defaultQuery} AND user_id:${currentUserId()}`
            case 'friends': {
                if (!user.friends) {
                    console.log('Could not find user friends, resorting to all')
                    return defaultQuery
                }

                let query = ''
                user.friends.forEach((friend, index) => {
                    query += (index === 0 ? '' : ' OR ') + `user_id:${friend.id}`
                })

                return defaultQuery + ` AND (${query})`
            }

            case 'all':
                return defaultQuery
            default:
                console.error('Unknown friend filter')
                return
        }
    }
}
