// @flow

import type {Node} from 'react'
import * as React from 'react'
import type {Id, Item, Lineup, List, RNNNavigator, Saving, SearchToken, User} from "../types"
import {RequestState} from "../types"
import EmptySearch, {renderBlankIcon} from "../ui/components/EmptySearch"
import {AlgoliaClient, createResultFromHit, createResultFromHit2} from "./AlgoliaUtils"
import Config from 'react-native-config'
import {renderLineupFromOtherPeople} from "../ui/UIComponents"
import {seeActivityDetails, seeUser} from "../ui/Nav"
import GTouchable from "../ui/GTouchable"
import ItemCell from "../ui/components/ItemCell"
import UserItem from "../ui/screens/userItem"

export type SearchCategoryType = string;

// A single page of result returned by search engine
export type SearchResult = {
    results: Array<*>,
    page: number,
    nbPages: number,
}
export type SearchQuery = {
    token: SearchToken,
    categoryType: SearchCategoryType,
    options?: any
}
export type SearchEngine = {
    search:
        (
            category: SearchCategoryType,
            page: number,
            searchOptions: SearchOptions
        ) => Promise<SearchResult>,
    generateSearchKey: (
        category: SearchCategoryType,
        searchOptions: SearchOptions
    ) => string,
    canSearch: (
        category: SearchCategoryType,
        searchOptions: SearchOptions
    ) => boolean
};
export type SearchOptions = {
    token?: string,
    aroundMe?: boolean,
    place?: string,
    lat?: number,
    lng?: number,
    friendFilter?: FRIEND_FILTER_TYPE,
    algoliaFilter?: string
}
export type SearchState = {
    requestState?: RequestState,
    page?: number,
    nbPages?: number,
    data?: Array<List | Saving>,
    showingMap?: boolean,
    isEmpty: boolean
};

export type SearchCategory = {
    type: SearchCategoryType,
    defaultOptions?: SearchOptions,

    // bad: only used for algolia
    parseResponse?: (hits: []) => *,

    renderItem: (item: *) => ?Node,

    //no results
    renderEmpty: Node,


    tabName?: string,
    description?: string,
    onItemSelected?: () => void,
    renderOptions?: ?RenderOptions,

}

export type RenderOptions = (SearchOptions, SearchOptions => void) => React.Element<any>

export type SearchItemCategoryType = "consumer_goods" | "places" | "musics" | "movies";

// QG to EA: let's try to follow the camel case convention for types
export type FRIEND_FILTER_TYPE = "me" | "friends" | "all" ;

export const SEARCH_CATEGORIES_TYPE: SearchItemCategoryType[] = ["consumer_goods", "places", "musics", "movies"]

// wrong type, used for tests, FIXME
// $FlowFixMe
export const SEARCH_ITEM_CATEGORIES: SearchCategory[] = SEARCH_CATEGORIES_TYPE.map(type => (
    {
        type: type,
        tabName: i18n.t("search_item_screen.tabs." + type),
        description: i18n.t("search_item_screen.placeholder." + type),
    }
))



export function SEARCH_CATEGORY_OTHERS_LIST_OR_SAVINGS(currentUserId: Id, renderItem: any => Node): SearchCategory {

    let index : Promise<any> = new Promise((resolve, reject) => {
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
    })

    return {
        type: "savings",
        index,
        defaultOptions: {algoliaFilter:  `NOT type:List AND NOT user_id:${currentUserId}`},
        tabName: i18n.t("network_search_tabs.savings"),
        placeholder: "search_bar.network_placeholder",
        parseResponse: createResultFromHit,
        renderEmpty: <EmptySearch
            icon={renderBlankIcon('savings')}
            text={i18n.t("search_item_screen.placeholder.savings")}
        />,
        renderItem
    }
}

export function SEARCH_CATEGORY_MY_LIST_OR_SAVINGS(currentUserId: Id, renderItem: any => Node): SearchCategory {
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

    return {
            type: "savings",
            index,
            defaultOptions: {algoliaFilter: `user_id:${currentUserId}`},
            placeholder: "search_bar.me_placeholder",
            parseResponse: createResultFromHit,
            renderEmpty: <EmptySearch text={i18n.t("lineups.search.empty")}/>,
            renderItem
        }
}

export function SEARCH_CATEGORY_USER(currentUserId: Id, renderItem: any => Node): SearchCategory {

    return {
        type: "users",
        index: AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_USER_INDEX),
        defaultOptions: {algoliaFilter: `NOT objectID:${currentUserId}`},
        tabName: i18n.t("network_search_tabs.users"),
        placeholder: "search_bar.network_placeholder",
        parseResponse: createResultFromHit2,
        renderItem,
        renderEmpty: <EmptySearch
            icon={renderBlankIcon('users')}
            text={i18n.t("search_item_screen.placeholder.users")}
        />
    }
}

export function SEARCH_CATEGORY_ITEM(categ: SearchItemCategoryType, renderItem: any => Node): SearchCategory {
    return {
        type: categ,
            tabName: i18n.t("search_item_screen.tabs." + categ),
        description: i18n.t("search_item_screen.placeholder." + categ),
        renderItem,
        renderEmpty: <EmptySearch text={i18n.t("search_item_screen.placeholder." + categ)}
        icon={renderBlankIcon(categ)}
    />
    }
}


export function renderSavingOrLineup(navigator: RNNNavigator) {

    return ({item}: {item: Lineup | Saving}): Node => {
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
    }
}

export function renderUser(navigator: RNNNavigator) {

    return ({item}: {item: User}) => {
        return (
            <GTouchable onPress={() => seeUser(navigator, item)}>
                <UserItem
                    user={item}
                    navigator={navigator}
                />
            </GTouchable>
        );
    }
}




