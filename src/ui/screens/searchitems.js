// @flow

import React from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import * as Api from "../../managers/Api"
import {Call} from "../../managers/Api"
import ItemCell from "../components/ItemCell"
import {buildData} from "../../helpers/DataUtils"
import type {
    SearchCategory,
    SearchCategoryType,
    SearchEngine, SearchOptions,
    SearchQuery,
    SearchResult, SearchState,
} from "../../helpers/SearchHelper"
import {RenderOptions, SEARCH_CATEGORIES_TYPE} from "../../helpers/SearchHelper"
import SearchScreen from "./search"
import normalize from 'json-api-normalizer'
import GTouchable from "../GTouchable"
import Screen from "../components/Screen"
import EmptySearch, {renderBlankIcon} from "../components/EmptySearch"
import type {Item, Lineup, RNNNavigator} from "../../types"
import {Colors} from "../colors"
import Geolocation from "../../managers/GeoLocation"
import type {SearchPlacesProps} from "./searchplacesoption"
import {SearchPlacesOption} from "./searchplacesoption"
import OpenAppSettings from 'react-native-app-settings'
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {findBestSearchCategory} from "../../helpers/Classifier"


type SearchToken = string;

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
        let categories = SEARCH_CATEGORIES_TYPE.map(categ=>{
            return {
                type: categ,
                tabName: i18n.t("search_item_screen.tabs." + categ),
                description: i18n.t("search_item_screen.placeholder." + categ),
                renderOptions: this.renderSearchOptions(categ),
                renderItem: ({item})=> (
                    <GTouchable
                        onPress={() => this.props.onItemSelected(item, this.props.navigator)}
                        disabled={!this.props.onItemSelected}>
                        <ItemCell item={item}/>
                    </GTouchable>
                ),
                renderEmpty: <EmptySearch
                    icon={renderBlankIcon(categ)}
                    text={i18n.t("search_item_screen.placeholder." + categ)}
                />
            }
        });


        const searchEngine: SearchEngine = {
            search: this.search.bind(this),
            getSearchKey: (category: SearchCategoryType, searchOptions: SearchOptions) => {
                //TODO: put back
                //if search places, do not auto search if tab change
                // if (category === 'places' && searchOptions && (searchOptions.aroundMe || searchOptions.place)) {
                //     if (searchOptions) {
                //         let {aroundMe, place} = searchOptions
                //         return aroundMe || place
                //     }
                // }
                const token = searchOptions.token
                if (_.isEmpty(token)) {
                    return null
                }
                return `${category}_${token}`
            }
        }
        return <SearchScreen
            searchEngine={searchEngine}
            categories={categories}
            placeholder={i18n.t('search.in_items')}
            index={this.findBestIndex(categories)}
            {...this.props}
            style={{backgroundColor: Colors.white}}
        />;
    }


    findBestIndex(categories: SearchCategory[]) {
        let index
        if (this.props.defaultLineup) {
            let best = findBestSearchCategory(this.props.defaultLineup, categories)
            if (best) {
                index = categories.indexOf(best)
                if (index < 0) index = 0
            }
        }
        return index
    }

    displayBlank(query: SearchQuery, searchState: SearchState) {
        const {
            token,
            categoryType,
            options,
        } = query;
        switch (categoryType) {
            case 'places':
                if (options && options.aroundMe) {
                    return !searchState || searchState.requestState === 'idle'
                }
                return _.isEmpty(token) ;
            default:
                return _.isEmpty(token);
        }
    }

    renderSearchOptions(category: SearchCategoryType): RenderOptions {
        if (category === 'places') {
            return (currentOptions: SearchOptions, onNewOptions: SearchPlacesProps) => {

                return <SearchPlacesOption
                    {...currentOptions}
                    onNewOptions={onNewOptions}
                    // onSearchSubmited={onSearchSubmited}
                    navigator={this.props.navigator}
                />
            }
        }
        return

    }

    search(category: SearchCategoryType, page: number, searchOptions: SearchOptions): Promise<*> {
        //searching
        const token = searchOptions.token;
        console.debug(`api: searching: token='${token}', category='${category}', page=${page}, options=`, searchOptions);

        return new Promise((resolve, reject) => {
            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`);

            if (!_.isEmpty(token)) {
                call.addQuery({'search[term]': token});
            }

            this.fillOptions(category, call, searchOptions)
                .then(call=> {
                    //maybe use redux here ?
                    call
                        .run()
                        .then(response=>{
                            let data = normalize(response.json);

                            let results = response.json.data.map(d=>{
                                return buildData(data, d.type, d.id);
                            });

                            resolve({results, page, nbPages: 0});
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

            }
            else {
                resolve(call);
            }
        });
    }

}
let screen = SearchItem;

export {screen};
