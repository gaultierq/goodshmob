// @flow

import React from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import {SearchBar} from 'react-native-elements'
import type {SearchCategoryType} from "../ui/screens/search";
import type {SearchToken} from "../types";
import algoliasearch from 'algoliasearch/reactnative';
import * as appActions from "../auth/actions";

type AlgoliaIndexName = string;
type AlgoliaIndex = *;



class AlgoliaClient {
    store: *;
    client: *;

    init(store): AlgoliaClient {
        this.store = store;
        return this;
    }

    createAlgoliaIndex(indexName: AlgoliaIndexName, count: number = 0) : Promise<AlgoliaIndex> {
        return new Promise((resolve, reject) => {
            if (this.client) {
                resolve(this.client.initIndex(indexName));
            }
            else {
                let {auth} = this.store.getState();

                if (!auth) {
                    reject("waiting for auth state");
                }
                else if (auth.algoliaToken) {
                    let algoliaToken = auth.algoliaToken;

                    algoliaToken = 'c80385095ff870f5ddf9ba25310a9d5a';

                    this.client = algoliasearch("8UTETUZKD3", algoliaToken);
                    resolve(this.client.initIndex(indexName));
                }
                else {
                    if (count > 0) {
                        reject("looping request");
                    }
                    else {
                        this.store.dispatch(appActions.me())
                            .then(this.createAlgoliaIndex(indexName, ++count), err=>console.warn(err));
                    }
                }

            }
        });

    }
}

const instance = new AlgoliaClient();


export {instance as AlgoliaClient};

export function makeAlgoliaSearch(categories, navigator) {

    let search = (token: SearchToken, categoryType: SearchCategoryType, page: number): Promise<*> => {

        //searching
        console.log(`algolia: searching ${token}`);

        //separate searches
        let categFiltered = categories.filter((c) => c.type === categoryType);
        let category = categFiltered[0];


        // const queries = categFiltered.map(c=> {return {...c.query, params: c.params, query: token}});
        const query = {...category.query, params: category.query.params, page, query: token};


        let indexResolver = category.index;

        return new Promise((resolve, reject) => {

            indexResolver.then(index => {
                index.search(query, (err, content) => {

                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }
                    let res = {};
                    let result = content;
                    let hits = result.hits;
                    console.log(`search result lists: ${hits.length}`);

                    let searchResult = category.parseResponse(hits);

                    let type = category.type;

                    let search = {};

                    search.results = searchResult;
                    search.page = result.page;
                    search.nbPages = result.nbPages;
                    res[type] = search;

                    // categFiltered.reduce((obj, c, i) => {
                    //     // categories.reduce((obj, c, i) => {
                    //
                    //     let result = _.get(content.results, 0, {hits: []});
                    //     let hits = result.hits;
                    //     console.log(`search result lists: ${hits.length}`);
                    //
                    //     let searchResult = c.parseResponse(hits);
                    //
                    //     let type = c.type;
                    //
                    //     let search = {};
                    //
                    //     search.results = searchResult;
                    //     search.page = result.page;
                    //     search.nbPages = result.nbPages;
                    //
                    //     obj[type] = search;
                    //     return obj;
                    // }, res);

                    resolve(res);
                });
            });
            // index.search(queries, (err, content) => {

        });
    };
    return search;
}



export function obtainClient(): Promise<AlgoliaClient> {
    return new Promise((resolve, reject) => {
        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");
        resolve(client);
    });
}



export function createResultFromHit(hits, options = {}) {
    let {filterItems} = options;

    let searchResult = [];
    let listsById: { [Id]: List } = {};
    hits.forEach((h) => {
        let hR = h["_highlightResult"];
        let matchedListName = hR["list_name"] && hR["list_name"]["matchLevel"] !== 'none';
        let matchedItemTitle = hR["item_title"] && hR["item_title"]["matchLevel"] !== 'none';

        const {
            objectID,
            list_name,
            item_title,
            list_id,
            user_id,
            type,
            image,
            url,
            user
        } = h;

        user2 = {
            firstName: user.first_name,
            lastName: user.last_name,
            ...user
        };

        let saving = {
            id: objectID,
            user: Object.assign({type: "users"}, user2, {id: user_id}),
            resource: {type, image, url, title: item_title},
            type: "savings"
        };

        if (matchedListName) {
            let list = listsById[list_id];
            if (!list) {
                list = {
                    id: list_id,
                    name: list_name,
                    user: Object.assign({type: "users"}, user2, {id: user_id}),
                    type: "lists",
                    savings: []
                };
                listsById[list_id] = list;

                //adding to the result for 1st match
                searchResult.push(list);
            }
            list.savings.push(saving);
        }

        //if matching a list, algolia will also notify us the item_title matching
        if (matchedItemTitle && !filterItems) {
            searchResult.push(saving);
        }
    });
    return searchResult;
}
export function createResultFromHit2(hits, options = {}) {

    return hits.map((h) => {

        const {
            objectID,
            first_name,
            last_name,
            email,
            image,
            friends_id
        } = h;

        return {
            id: objectID,
            firstName: first_name,
            lastName: last_name,
            email,
            image,
            type: "users",
            friends: friends_id.map(id=>{return {id, type: "users"}})
        };


    });
}