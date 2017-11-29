// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {connect} from "react-redux";
import {combineReducers} from "redux";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import {SearchBar} from 'react-native-elements'
import SearchScreen from "./search";
import algoliasearch from 'algoliasearch/reactnative';
import type {SearchToken} from "../types";
import type {SearchCategoryType} from "./search";

// export default class AlgoliaSearchScreen extends Component<*,*> {
//     static navigatorButtons = {
//         rightButtons: [
//             {
//                 //icon: require('../img/drawer_line_up.png'), // for icon button, provide the local image asset name
//                 id: 'cancel_search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
//                 title: "Cancel"
//             }
//         ],
//     };
//
//     render() {
//         return <SearchScreen
//             searchEngine={{search: this.search.bind(this)}}
//             {...this.props}
//         />;
//     }
//
// }
const HITSPERPAGE = 2;

export function makeAlgoliaSearch(categories, navigator) {

    let search = (token: SearchToken, category: SearchCategoryType, page: number): Promise<*> => {

        //searching
        console.log(`algolia: searching ${token}`);

        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");

        // const queries = categories.map(c => {
        //     let q = c.query;
        //     let params = q.params;
        //     params = {...params, page, HITSPERPAGE: 2};
        //     return {...q, params, query: token}
        // });

        //separate searches
        let categFiltered = categories.filter((c) => c.type === category);


        // const queries = categFiltered.map(c=> {return {...c.query, params: c.params, query: token}});

        const queries = categFiltered.map(c => {
            let q = c.query;
            let params = q.params;
            
            params = {...params, page, hitsPerPage: HITSPERPAGE};
            return {...q, params, query: token}
        });

        return new Promise((resolve, reject) => {

            client.search(queries, (err, content) => {

                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                let res = {};

                categFiltered.reduce((obj, c, i) => {
                // categories.reduce((obj, c, i) => {

                    let result = content.results[i];
                    let hits = result.hits;
                    console.log(`search result lists: ${hits.length}`);

                    let searchResult = c.parseResponse(hits);

                    let type = c.type;

                    let search = {};

                    search.results = searchResult;
                    search.page = result.page;
                    search.nbPages = result.nbPages;

                    obj[type] = search;
                    return obj;
                }, res);

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




