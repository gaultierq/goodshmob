// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import * as Api from "../../utils/Api";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import ItemCell from "../components/ItemCell";
import {buildData} from "../../utils/DataUtils";
import {SearchBar} from 'react-native-elements'
import type {SearchCategoryType} from "./search";
import SearchScreen from "./search";
import normalize from 'json-api-normalizer';

type SearchCategory = "consumer_goods" | "places" | "musics" | "movies";
type SearchToken = string;

const SEARCH_CATEGORIES : Array<SearchCategory> = [ "consumer_goods", "places", "musics", "movies"];


class SearchItem extends Component<*,*> {

    render() {

        let categories = SEARCH_CATEGORIES.map(categ=>{
            return {
                type: categ,
                tabName: "search_item_screen.tabs." + categ,
                placeholder: "search_item_screen.placeholder." + categ,
                renderItem: ({item})=> <TouchableOpacity onPress={() => this.props.onItemSelected(item)}>
                    <ItemCell item={item}/>
                </TouchableOpacity>

            }
        });

        return <SearchScreen
            searchEngine={{search: this.search.bind(this)}}
            categories={categories}
            {...this.props}
        />;
    }

    search(token: SearchToken, category: SearchCategoryType, page: number): Promise<*> {

        //searching
        console.log(`api: searching ${token}`);

        return new Promise((resolve, reject) => {

            //actions.searchFor(this.state.input, cat)

            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`)
                .addQuery({'search[term]': token});

            //maybe use redux here ?
            call
                .run()
                .then(response=>{
                    console.log(response);
                    let data = normalize(response.json);

                    let results = response.json.data.map(d=>{
                        return buildData(data, d.type, d.id);
                    });

                    resolve({
                        [category]: {
                            results, page, nbPages: 0
                        }
                    });
                }, err=> {
                    //console.warn(err)
                    reject(err);
                });
        });
    }

}
let screen = SearchItem;

export {screen};
