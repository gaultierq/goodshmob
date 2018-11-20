// @flow

import type {Element, Node} from 'react'
import * as React from 'react'
import type {Lineup, List, RNNNavigator, Saving, User} from "../types"
import {RequestState} from "../types"
import {GoodshContext, RENDER_EMPTY_ME_RESULT, RENDER_EMPTY_RESULT, renderLineup} from "../ui/UIComponents"
import {seeActivityDetails, seeUser} from "../ui/Nav"
import GTouchable from "../ui/GTouchable"
import ItemCell from "../ui/components/ItemCell"
import UserItem from "../ui/screens/userItem"
import {StyleSheet, Text} from "react-native"
import type {SearchItemsGenOptions} from "../ui/screens/search/SearchGeneric"
import * as Api from "../managers/Api"
import {Call} from "../managers/Api"
import {currentUserId} from "../managers/CurrentUser"
import type {SearchItemCategoryType} from "./SearchConstants"
import {fullName} from "./StringUtils"
import {Colors} from "../ui/colors"
import {SEARCH_CATEGORIES_TYPE} from "./SearchConstants"

export type SearchCategoryType = string;

// A single page of result returned by search engine
export type SearchResult = {
    results: Array<*>,
    page: number,
    nbPages: number,
}

export type SearchEngine<SO> = (searchOptions: SO, page: number,) => Promise<SearchResult>

export const PERMISSION_EMPTY_INPUT = 'empty_input'

// Happens when the user is selecting a place
export const PERMISSION_EMPTY_POSITION = 'empty_position'
export const PERMISSION_NO_FRIEND = 'no_friend'


export type SearchOptions = {
    token?: string,
    place?: string,
    lat?: number,
    lng?: number,
    friendFilter?: FRIEND_FILTER_TYPE,
    algoliaFilter?: string,

}
export type SearchState = {
    requestState?: RequestState,
    page?: number,
    nbPages?: number,
    data?: Array<List | Saving>,
};

// QG to EA: let's try to follow the camel case convention for types
export type FRIEND_FILTER_TYPE = "me" | "friends" | "all" ;





// wrong type, used for tests, FIXME
// $FlowFixMe


export function renderSavingOrLineup(navigator: RNNNavigator) {

    return ({item}: {item: Lineup | Saving}): Node => {
        let isLineup = item.type === 'lists';


        if (item.type === 'lists') {
            return renderLineup(navigator, item)
        }
        else {
            return renderSaving2(item, navigator)

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


export function __createSearchItemSearcher<SO: SearchItemsGenOptions>(type: SearchItemCategoryType): (searchOptions: SO, page: number,) => Promise<SearchResult> {

    return (options: SO, page) => __searchItems(type, page, options)
}

function __searchItems<SO: SearchItemsGenOptions>(category: SearchCategoryType, page: number, searchOptions: SO): Promise<*> {

    let fillOptions = (category: SearchCategoryType, call: Call, options: any) => {
        return new Promise((resolve, reject) => {
            if (category === 'places') {
                resolve(call);
                call.addQuery({'search[lat]': options.lat})
                    .addQuery({'search[lng]': options.lng});
                resolve(call);
            } else {
                resolve(call);
            }
        });
    }

    //searching
    const token = searchOptions.input;
    console.debug(`api: searching: token='${token}', category='${category}', page=${page}, options=`, searchOptions);

    return new Promise((resolve, reject) => {
        let call = new Api.Call()
            .withMethod('GET')
            .withRoute(`search/${category}`);

        if (!_.isEmpty(token)) {
            call.addQuery({'search[term]': token});
        }

        fillOptions(category, call, searchOptions)
            .then(call=> {
                //maybe use redux here ?
                call
                    .run()
                    .then(response=>{

                        resolve({results: response.json, page, nbPages: 0});
                    }, err=> {
                        //console.warn(err)
                        reject(err);
                    });
            }, err => reject(err));
    });
}

export type AlgoliaSearchConfig = {
    index: any,
    query?: any,
    geoSearch?: boolean,
    parseResponse: (hits: []) => *,
}

export function __createAlgoliaSearcher<SO: any>(
    config: AlgoliaSearchConfig
)
    : (searchOptions: SO, page: number,) => Promise<SearchResult> {

    return (searchOptions: SO, page: number): Promise<*> => {

        //searching
        const token = searchOptions.token || ''

        let query = {
            ...config.query,
            filters: searchOptions.algoliaFilter,
            page,
            query: token,
        }
        if (config.geoSearch) {
            const aroundLatLng = `${searchOptions.lat}, ${searchOptions.lng}`
            query['aroundLatLng'] = aroundLatLng
            query['aroundRadius'] = searchOptions.radius
        }

        console.log(`%c algolia: sending`, 'background: #FCFCFC; color: #E36995', searchOptions, query);

        return new Promise((resolve, reject) => {

            config.index.then(index => {
                index.search(query, (err, content) => {

                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    let result = content;
                    let hits = result.hits;
                    console.log(`search result: ${hits.length} hits`, hits);

                    let searchResult = config.parseResponse(hits);

                    let search:SearchResult = {results: searchResult,
                        page: result.page,
                        nbPages: result.nbPages};
                    resolve(search);
                });
            });

        });
    }
}


export function makeBrowseAlgoliaFilter2(friendFilter: FRIEND_FILTER_TYPE, category: ?string, user: User): string {


    let CATEGORY_TO_TYPE = {
        consumer_goods: 'type:CreativeWork',
        places: 'type:Place',
        musics: '(type:Track OR type:Album OR type:Artist)',
        movies: '(type:Movie OR type:TvShow)'
    }

    let append = (left: string, right: string) => [left, right].filter(s => !_.isEmpty(s)).join(" AND ")

    let defaultQuery = ""
    if (category ) {
        defaultQuery += `${CATEGORY_TO_TYPE[category]}`
    }

    switch(friendFilter) {
        case 'me':
            return append(defaultQuery, `user_id:${currentUserId()}`)

        case 'friends': {
            if (_.isEmpty(user.friends)) {
                console.log('Could not find user friends, resorting to all')
                return defaultQuery
            }

            let query = ''
            user.friends.forEach((friend, index) => {
                query += (index === 0 ? '' : ' OR ') + `user_id:${friend.id}`
            })
            return append(defaultQuery, `(${query})`)
        }

        case 'all':
            return defaultQuery
        default:
            console.error('Unknown friend filter' + friendFilter)
            return ''
    }
}

export function renderSaving({item}: {item: Saving}, navigator: RNNNavigator) {
    return renderSaving2(item, navigator)
}


export function renderSaving2(item: Saving, navigator: RNNNavigator) {

    let saving = item;

    let resource = saving.resource;

    //TODO: this is hack
    if (!resource) return null;

    return (
        <GoodshContext.Consumer>
            { ({userOwnResources}) => (
                <GTouchable onPress={() => seeActivityDetails(navigator, saving)}>
                    <ItemCell item={resource} >
                        {
                            !userOwnResources && (
                                <Text style={{color: Colors.greyish, fontSize: 14}}>
                                    {
                                        i18n.t("by", {who: fullName(saving.user)})
                                    }
                                </Text>
                            )
                        }

                    </ItemCell>
                </GTouchable>
            )}
        </GoodshContext.Consumer>
    )
}

export const renderEmptyResults = (scope: FRIEND_FILTER_TYPE, category: SEARCH_CATEGORIES_TYPE, navigator: RNNNavigator): ?() => Element<any>  => {
    switch (scope) {
        case "me": return RENDER_EMPTY_ME_RESULT(navigator, category)
        case "friends": return RENDER_EMPTY_RESULT
        case "all": return RENDER_EMPTY_RESULT
    }
}
