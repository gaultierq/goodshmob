// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native';
import {connect} from "react-redux";
import {combineReducers} from "redux";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import {SearchBar} from 'react-native-elements'
import SearchScreen from "./search2";
import algoliasearch from 'algoliasearch/reactnative';
import type {SearchToken} from "../types";

@connect()
export default class AlgoliaSearchScreen extends SearchScreen {

    render() {
        return <SearchScreen
            searchEngine={{search: this.search.bind(this)}}
            {...this.props}
        />;
    }

    search(token: SearchToken, page: number): Promise<*> {

        //searching
        console.log(`algolia: searching ${token}`);

        let client = algoliasearch("8UTETUZKD3", "c80385095ff870f5ddf9ba25310a9d5a");

        const queries = this.props.categories.map(c=>{
            let q = c.query;
            let params = q.params;
            params = {...params, page, hitsPerPage: 2};
            return {...q, params, query: token}
        });

        return new Promise((resolve, reject) => {

            client.search(queries, (err, content) => {

                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                let res =  {};
                this.props.categories.reduce((obj, c, i) => {

                    let result = content.results[i];
                    let hits = result.hits;
                    console.log(`search result lists: ${content.length}`);

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
    }

}




