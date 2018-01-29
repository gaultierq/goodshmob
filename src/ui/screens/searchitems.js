// @flow

import React from 'react';
import {ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import * as Api from "../../managers/Api";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import ItemCell from "../components/ItemCell";
import {buildData} from "../../helpers/DataUtils";
import {SearchBar} from 'react-native-elements'
import type {SearchCategoryType} from "./search";
import SearchScreen from "./search";
import normalize from 'json-api-normalizer';
import GTouchable from "../GTouchable";
import Screen from "../components/Screen";
import type {Item, RNNNavigator} from "../../types";
import {Colors} from "../colors";

type SearchCategory = "consumer_goods" | "places" | "musics" | "movies";
type SearchToken = string;

const SEARCH_CATEGORIES : Array<SearchCategory> = [ "consumer_goods", "places", "musics", "movies"];


type Props = {
    onItemSelected?: (item: Item, navigator: RNNNavigator) => void
};

type State = {
};

class SearchItem extends Screen<Props, State> {

    render() {

        let categories = SEARCH_CATEGORIES.map(categ=>{
            return {
                type: categ,
                tabName: "search_item_screen.tabs." + categ,
                placeholder: "search_item_screen.placeholder." + categ,
                renderItem: ({item})=> <GTouchable onPress={() => this.props.onItemSelected(item, this.props.navigator)}>
                    <ItemCell item={item}/>
                </GTouchable>

            }
        });

        return <SearchScreen
            searchEngine={{search: this.search.bind(this)}}
            categories={categories}
            placeholder={i18n.t('search.in_items')}
            {...this.props}
            style={{backgroundColor: Colors.white}}
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
