// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {connect} from "react-redux";
import {combineReducers} from "redux";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import {SearchBar} from 'react-native-elements'
import SearchScreen from "../screens/search";
import algoliasearch from 'algoliasearch/reactnative';
import type {SearchToken} from "../types";
import type {SearchCategoryType} from "../screens/search";

const HITSPERPAGE = 20;

export function makeAlgoliaSearch(categories, navigator) {

    let search = (token: SearchToken, categoryType: SearchCategoryType, page: number): Promise<*> => {

        //searching
        console.log(`algolia: searching ${token}`);

        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");

        //separate searches
        let categFiltered = categories.filter((c) => c.type === categoryType);
        let category = categFiltered[0];


        // const queries = categFiltered.map(c=> {return {...c.query, params: c.params, query: token}});
        const query = {...category.query, params: category.query.params, query: token};

        // const queries = categFiltered.map(c => {
        //     let q = c.query;
        //     let params = q.params;
        //
        //     params = {...params, page, hitsPerPage: HITSPERPAGE};
        //     return {...q, params, query: token}
        // });

        let index = category.index;

        return new Promise((resolve, reject) => {

            // index.search(queries, (err, content) => {
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
    };

    return <SearchScreen
        searchEngine={{search}}
        categories={categories}
        navigator={navigator}
    />;
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