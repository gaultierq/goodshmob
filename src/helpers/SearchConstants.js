import React from 'react'
import type {SearchCategoryType, SearchOptions} from "./SearchHelper"


export type SearchItemCategoryType = "consumer_goods" | "places" | "musics" | "movies";

export const SEARCH_CATEGORIES_TYPE: SearchItemCategoryType[] = ["consumer_goods", "places", "musics", "movies"]

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
export const SEARCH_ITEM_CATEGORIES: SearchCategory[] = SEARCH_CATEGORIES_TYPE.map(type => (
    {
        type: type,
        tabName: i18n.t("search_item_screen.tabs." + type),
        description: i18n.t("search_item_screen.placeholder." + type),
    }
))
