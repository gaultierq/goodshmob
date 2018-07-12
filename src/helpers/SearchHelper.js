// @flow

import type {i18Key, List, Saving, SearchToken} from "../types"
import {RequestState} from "../types"
import * as React from 'react'

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
    requestState: RequestState,
    page: number,
    nbPages: number,
    data: Array<List | Saving>,
    searchKey: string,
};

export type SearchCategory = {
    type: SearchCategoryType,
    defaultOptions?: SearchOptions,
    parseResponse: (hits: []) => *,
    renderItem: (item: *) => React.Element<any> | null,
    renderEmpty: () => React.Element<any>,
    tabName?: string,
    description?: string,
    placeholder: i18Key,
    onItemSelected?: () => void,
    renderOptions?: RenderOptions,
    renderBlank?: () => Node,
}

export type RenderOptions = (SearchOptions, SearchOptions => void) => React.Element<any>

export type SearchItemCategoryType = "consumer_goods" | "places" | "musics" | "movies";
export type FRIEND_FILTER_TYPE = "me" | "friends" | "all" ;

export const SEARCH_CATEGORIES_TYPE: SearchItemCategoryType[] = ["consumer_goods", "places", "musics", "movies"]
export const SEARCH_ITEM_CATEGORIES: SearchCategory[] = SEARCH_CATEGORIES_TYPE.map(type => (
    {
        type: type,
        tabName: i18n.t("search_item_screen.tabs." + type),
        description: i18n.t("search_item_screen.placeholder." + type),
    }
))
