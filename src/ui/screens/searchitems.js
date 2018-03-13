// @flow

import React from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import ItemCell from "../components/ItemCell";
import {buildData} from "../../helpers/DataUtils";
import {CheckBox, SearchBar} from 'react-native-elements'
import type {SearchCategoryType, SearchEngine} from "./search";
import SearchScreen from "./search";
import normalize from 'json-api-normalizer';
import GTouchable from "../GTouchable";
import Screen from "../components/Screen";
import type {Item, RNNNavigator} from "../../types";
import {Colors} from "../colors";
import Geolocation from "../../managers/GeoLocation"
import type {SearchPlacesProps} from "./searchplacesoption";
import {SearchPlacesOption} from "./searchplacesoption";

type SearchCategory = "consumer_goods" | "places" | "musics" | "movies";
type SearchToken = string;

const SEARCH_CATEGORIES : Array<SearchCategory> = [ "consumer_goods", "places", "musics", "movies"];


type Props = {
    onItemSelected?: (item: Item, navigator: RNNNavigator) => void
};

type State = {
};

class SearchItem extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };


    renderSearchOptions(category: SearchCategoryType) {
        return category === 'places' && {
            renderOptions: (currentOptions: any, onNewOptions: SearchPlacesProps, onSearchSubmited: any) => (
                <SearchPlacesOption
                    {...currentOptions}
                    onNewOptions={onNewOptions}
                    onSearchSubmited={onSearchSubmited}
                    navigator={this.props.navigator}
                />
            ),
        };

    }

    render() {

        let categories = SEARCH_CATEGORIES.map(categ=>{
            return {
                type: categ,
                tabName: "search_item_screen.tabs." + categ,
                placeholder: "search_item_screen.placeholder." + categ,
                renderItem: ({item})=> <GTouchable onPress={() => this.props.onItemSelected(item, this.props.navigator)}>
                    <ItemCell item={item}/>
                </GTouchable>,
                searchOptions: this.renderSearchOptions(categ)

            }
        });

        const searchEngine: SearchEngine = {
            search: this.search.bind(this),
            canSearch: (token: SearchToken, category: SearchCategoryType, searchOptions: ?any) => {
                if (category === 'places' && searchOptions && (searchOptions.aroundMe || searchOptions.place)) return true;
                return !_.isEmpty(token);
            }
        };
        return <SearchScreen
            searchEngine={searchEngine}
            categories={categories}
            placeholder={i18n.t('search.in_items')}
            {...this.props}
            style={{backgroundColor: Colors.white}}
        />;
    }

    search(token: SearchToken, category: SearchCategoryType, page: number, options: ?any): Promise<*> {

        //searching
        console.debug(`api: searching: token='${token}', category='${category}', page=${page}, options=`, options);

        return new Promise((resolve, reject) => {

            //actions.searchFor(this.state.input, cat)

            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`);

            if (!_.isEmpty(token)) {
                call.addQuery({'search[term]': token});
            }


            // if (category === 'places') {
            //     if (options) {
            //         if (!_.isEmpty(options.city)) {
            //             call.addQuery({'search[city]': options.city})
            //         }
            //         else {
            //             let {latitude, longitude} = Geolocation.getPosition() || {};
            //             call.addQuery(latitude && {'search[lat]': latitude})
            //                 .addQuery(longitude && {'search[lng]': longitude})
            //         }
            //     }
            // }
            this.fillOptions(category, call, options)
                .then(call=> {
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
                }, err => reject(err));
        });
    }

    getPosition(options: any = {}) {
        if (options.aroundMe) {
            return Geolocation.getPosition();
        }
        else {
            return new Promise((resolve, reject) => {
                let {lat, lng} = options;
                if (lat && lng) {
                    resolve({latitude: lat, longitude: lng});
                }
                else {
                    resolve({});
                }
            });
        }
    }

    fillOptions(category: SearchCategoryType, call: Call, options: any) {
        return new Promise((resolve, reject) => {
            if (category === 'places') {
                this.getPosition(options).then(({latitude, longitude}) => {
                    call.addQuery(latitude && {'search[lat]': latitude})
                        .addQuery(longitude && {'search[lng]': longitude});
                    resolve(call);
                }, err => reject(err));

                // if (options.aroundMe) {
                //     Geolocation.getPosition().then(({latitude, longitude}) => {
                //         call.addQuery(latitude && {'search[lat]': latitude})
                //             .addQuery(longitude && {'search[lng]': longitude});
                //         resolve(call);
                //     }, err => reject(err));
                // }
                // else {
                //     if (!_.isEmpty(options.lat)) {
                //         // call.addQuery({'search[city]': options.city});
                //         call.addQuery(latitude && {'search[lat]': options.lat})
                //             .addQuery(longitude && {'search[lng]': options.lng});
                //     }
                //     resolve(call);
                // }
            }
            else {
                resolve(call);
            }
        });
    }

}
let screen = SearchItem;

export {screen};
