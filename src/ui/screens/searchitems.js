// @flow

import type {Node} from 'react'
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
    RenderOptions,
    SearchCategory,
    SearchCategoryType,
    SearchEngine,
    SearchOptions,
    SearchQuery,
    SearchState,
} from "../../helpers/SearchHelper"
import {SEARCH_CATEGORIES_TYPE, SEARCH_CATEGORY_ITEM} from "../../helpers/SearchHelper"
import SearchScreen from "./search"
import normalize from 'json-api-normalizer'
import GTouchable from "../GTouchable"
import Screen from "../components/Screen"
import type {Item, Lineup, RNNNavigator} from "../../types"
import {Colors} from "../colors"
import Geolocation from "../../managers/GeoLocation"
import type {SearchPlacesProps} from "./searchplacesoption"
import {SearchPlacesOption, getPositionOrAskPermission, getPosition} from "./searchplacesoption"
import OpenAppSettings from 'react-native-app-settings'
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {findBestSearchCategory} from "../../helpers/Classifier"


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


    categories: Array<SearchCategory>
    searchEngine: SearchEngine

    constructor(props: Props) {
        super(props)
        this.categories = SEARCH_CATEGORIES_TYPE.map(categ => (
                {
                    ...SEARCH_CATEGORY_ITEM(categ, this.renderItem.bind(this)),
                    renderOptions: this.renderSearchOptions(categ),
                    geoResult: categ === 'places',
                    defaultOptions: categ === 'places' ? {aroundMe: true} : {}
                }
            )
        )
        this.searchEngine = {
            search: this.search.bind(this),
            generateSearchKey: (category: SearchCategoryType, searchOptions: SearchOptions) => {
                const token = searchOptions.token
                let searchKey = `${category}_${token}`

                if (searchOptions.aroundMe) {
                    searchKey += '_aroundMe'
                }

                if (searchOptions.place) {
                    const {place, lat, lng} = searchOptions
                    searchKey += `_${place}_${lat || 0}_${lng || 0}`
                }

                return searchKey
            },
            canSearch: (category: SearchCategoryType, searchOptions: SearchOptions) => {
                console.debug('canSearch', category, searchOptions, _.isEmpty(searchOptions.token))

                return new Promise((resolve, reject) => {
                    if (category === 'places') {
                        if (searchOptions.aroundMe) {
                            const pro = getPositionOrAskPermission(searchOptions)
                            return resolve(pro)
                        } else if (searchOptions.lat && searchOptions.lng) {
                            return resolve()
                        } else {
                            console.log('SEARCH ERROR: position not defined')
                            return reject()
                        }
                    }
                    const token = searchOptions.token
                    if (!_.isEmpty(token)) {
                        resolve()
                    } else {
                        reject()
                    }
                })

            }
        }
    }

    render() {

        return <SearchScreen
            searchEngine={this.searchEngine}
            categories={this.categories}
            placeholder={i18n.t('search.in_items')}
            index={this.findBestIndex(this.categories)}
            navigator={this.props.navigator}
            style={{backgroundColor: Colors.white}}
        />;
    }

    renderItem({item}: {item: Item}) {
        return <GTouchable
            onPress={() => this.props.onItemSelected(item, this.props.navigator)}
            disabled={!this.props.onItemSelected}>
            <ItemCell item={item}/>
        </GTouchable>
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

    renderSearchOptions(category: SearchCategoryType): ?RenderOptions {
        if (category === 'places') {
            return (currentOptions: SearchOptions, onNewOptions: SearchOptions => void) => {

                return <SearchPlacesOption
                    {...currentOptions}
                    onNewOptions={(p) => onNewOptions(getPosition(p))}
                    // onSearchSubmited={onSearchSubmited}
                    navigator={this.props.navigator}
                />
            }
        }
        return null
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


    fillOptions(category: SearchCategoryType, call: Call, options: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (category === 'places') {
                getPosition(options).then(({latitude, longitude}) => {
                    call.addQuery(latitude && {'search[lat]': latitude})
                        .addQuery(longitude && {'search[lng]': longitude});
                    resolve(call);
                }, err => {
                    console.debug("UNEXPECTED SEARCH ERROR: at this stage we should have position permission", err);
                    reject(err)
                });
            } else {
                resolve(call);
            }
        });
    }


}
let screen = SearchItem;

export {screen};
