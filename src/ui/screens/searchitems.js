// @flow

import React from 'react';
import {
    ActivityIndicator, Alert,
    Animated, Linking,
    Easing,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,

} from 'react-native';
import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import ItemCell from "../components/ItemCell";
import {buildData} from "../../helpers/DataUtils";
import type {SearchCategoryType, SearchEngine, SearchQuery, SearchState, SearchTrigger} from "./search";
import SearchScreen from "./search";
import normalize from 'json-api-normalizer';
import GTouchable from "../GTouchable";
import Screen from "../components/Screen";
import EmptySearch from "../components/EmptySearch";
import type {Color, Item, Lineup, RNNNavigator} from "../../types"
import {Colors} from "../colors";
import Geolocation from "../../managers/GeoLocation"
import type {SearchPlacesProps} from "./searchplacesoption";
import {SearchPlacesOption} from "./searchplacesoption";
import OpenAppSettings from 'react-native-app-settings'
import SearchPage from "./SearchPage";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {findBestSearchCategory} from "../../helpers/Classifier"



type SearchItemCategoryType = "consumer_goods" | "places" | "musics" | "movies";
type SearchToken = string;

const SEARCH_CATEGORIES : SearchItemCategoryType[] = [ "consumer_goods", "places", "musics", "movies"];


type Props = {
    onItemSelected?: (item: Item, navigator: RNNNavigator) => void,
    defaultLineup?: Lineup
};

type State = {
};

class SearchItem extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };



    render() {

        let categories = SEARCH_CATEGORIES.map(categ=>{
            return {
                type: categ,
                tabName: "search_item_screen.tabs." + categ,
                // placeholder: "search_item_screen.placeholder." + categ,

                searchOptions: this.renderSearchOptions(categ),
                renderResults: ({query, results}) => {

                    if (this.displayBlank(query, results)) {
                        return (
                            <KeyboardAwareScrollView
                                contentContainerStyle={{flex:1}}
                                scrollEnabled={false}
                                keyboardShouldPersistTaps='always'
                                // style={{position: 'absolute', bottom:0, top: 0}}
                            >
                                <EmptySearch categ={categ}/>


                            </KeyboardAwareScrollView>
                        )
                    }
                    return (

                        <SearchPage
                            search={results}
                            renderItem={({item})=> (
                                <GTouchable
                                    onPress={() => this.props.onItemSelected(item, this.props.navigator)}
                                    disabled={!this.props.onItemSelected}
                                >
                                    <ItemCell item={item}/>
                                </GTouchable>
                            )}
                        />
                    )},

            }
        });


        const searchEngine: SearchEngine = {
            search: this.search.bind(this),
            canSearch: (token: SearchToken, category: SearchCategoryType, trigger: SearchTrigger, searchOptions?:any) => {
                //if search places, do not auto search if tab change
                if (category === 'places' && searchOptions && (searchOptions.aroundMe || searchOptions.place)) {
                    if (searchOptions) {
                        let {aroundMe, place} = searchOptions
                        return aroundMe || place
                    }

                }
                return !_.isEmpty(token);
            }
        }
        return <SearchScreen
            searchEngine={searchEngine}
            categories={categories}
            placeholder={i18n.t('search.in_items')}
            index={this.findBestIndex()}
            {...this.props}
            style={{backgroundColor: Colors.white}}
        />;
    }


    findBestIndex() {
        let index
        if (this.props.defaultLineup) {
            let ffs: string[] = [].concat(SEARCH_CATEGORIES)
            let best = findBestSearchCategory(this.props.defaultLineup, ffs)
            if (best) {
                index = ffs.indexOf(best)
                if (index < 0) index = 0
            }
        }
        return index
    }

    displayBlank(query: SearchQuery, results: SearchResult) {
        const {
            token,
            categoryType,
            options,

        } = query;
        switch (categoryType) {
            case 'places':
                if (options && options.aroundMe) {
                    return !results || results.state === 0
                }
                return _.isEmpty(token) ;
            default:
                return _.isEmpty(token);
        }


    }

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

    search(token: SearchToken, category: SearchCategoryType, page: number, options?:any): Promise<*> {

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
                }, err => {
                    console.debug("error detected", err);
                    // if (__IS_ANDROID__ err.msg === 'No location provider available.') {
                    // if (__IS_IOS__ && err.msg === 'User denied access to location services.') {
                    Alert.alert(
                        i18n.t("alert.position.title"),
                        i18n.t("alert.position.message"),
                        [
                            {
                                text: i18n.t('alert.position.button'),
                                onPress: () => {
                                    OpenAppSettings.open()
                                },
                            },

                        ],
                        { cancelable: true }
                    );


                    reject(err)
                });

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
