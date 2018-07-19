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
    SearchEngine, SearchItemCategoryType,
    SearchOptions,
    SearchQuery,
    SearchState,
} from "../../helpers/SearchHelper"
import SearchScreen from "./search"
import normalize from 'json-api-normalizer'
import GTouchable from "../GTouchable"
import Screen from "../components/Screen"
import type {Item, Lineup, RNNNavigator} from "../../types"
import {Colors} from "../colors"
import {getPosition, getPositionOrAskPermission, SearchPlacesOption} from "./searchplacesoption"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {findBestSearchCategory} from "../../helpers/Classifier"
import {LINEUP_PADDING, NAV_BACKGROUND_COLOR} from "../UIStyles"
import GSearchBar2 from "../components/GSearchBar2"
import SearchPage, {ISearchPage} from "./searchpage"
import {SearchResult} from "../../helpers/SearchHelper"


type Props = {
    onItemSelected?: (item: Item, navigator: RNNNavigator) => void,
    defaultLineup?: Lineup
};

type State = {
};


export default class SearchItem2 extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    render() {
        return <SearchItem
         category={"musics"}
         placeholder={"search musics"}
        />
    }

    renderItem({item}: {item: Item}) {
        return (
            <GTouchable
                onPress={() => this.props.onItemSelected(item, this.props.navigator)}
                disabled={!this.props.onItemSelected}>
                <ItemCell item={item}/>
            </GTouchable>
        )
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

                const onNewPosition = (newPosition) => {
                    getPosition(newPosition).then((detailedPosition) => {
                        // We need to merge the origal object, with the newPosition (contains aroundMe),
                        // and the lat and lng if they are not defined
                        const newOptions = {...currentOptions,
                            ...newPosition,
                            ...{lat: detailedPosition.latitude, lng: detailedPosition.longitude}
                        }
                        onNewOptions(newOptions)
                    })
                }
                return <SearchPlacesOption
                    {...currentOptions}
                    onNewOptions={onNewPosition}
                    // onSearchSubmited={onSearchSubmited}
                    navigator={this.props.navigator}
                />
            }
        }
        return null
    }
}

function __createSearcher<SO: SearchItemsOptions>(type: SearchItemCategoryType): (searchOptions: SO, page: number,) => Promise<SearchResult> {

    return (options: SO, page) => __searchItems(type, page, options)
}

function __searchItems<SO: SearchItemsOptions>(category: SearchCategoryType, page: number, searchOptions: SO): Promise<*> {
    //searching
    const token = searchOptions.input;
    console.debug(`api: searching: token='${token}', category='${category}', page=${page}, options=`, searchOptions);

    return new Promise((resolve, reject) => {
        let call = new Api.Call()
            .withMethod('GET')
            .withRoute(`search/${category}`);

        if (!_.isEmpty(token)) {
            call.addQuery({'search[term]': token});
        }

        fillOptions(category, call, searchOptions)
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


function fillOptions(category: SearchCategoryType, call: Call, options: any): Promise<any> {
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

function __makeSearchEngine<SO: SearchItemsOptions>(category: SearchItemCategoryType) {
    return {
        search: __createSearcher(category),
        generateSearchKey: (searchOptions: SearchItemsOptions) => {
            throw 'generateSearchKeyIsUseless'
        },
        canSearch: (searchOptions: SO) => {
            console.debug('canSearch', category, searchOptions, _.isEmpty(searchOptions.input))

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
                const token = searchOptions.input
                if (!_.isEmpty(token)) {
                    resolve()
                } else {
                    reject()
                }
            })

        }
    }
}


type SearchItemsOptions = {input: string}


type SearchMusicOptions = SearchItemsOptions
type SMS = {
    search: SearchEngine<SearchMusicOptions>,
    searchOptions: SearchMusicOptions,

}
type SMP = {
    category: SearchItemCategoryType,
    placeholder: string
}

class SearchItem extends React.Component<SMP, SMS> {

    constructor(props: SMP) {
        super(props)
        this.state = {
            searchOptions: {
                input: ''
            },
            search: {
                search: __createSearcher(props.category),
                canSearch: searchOptions => Promise.resolve(!_.isEmpty(searchOptions.input))
            }
        }
    }

    render() {
        return (
            <View>
                <GSearchBar2
                    onChangeText={(input: string)  => {this.setState({searchOptions: {...this.state.searchOptions, input}})}}
                    value={_.get(this.state, this.state.searchOptions.input)}
                    style={styles1.searchBar}
                    placeholder={this.props.placeholder}
                    autoFocus
                />
                <SearchPage
                    searchEngine={this.state.search}
                    renderItem={({item}) => <ItemCell item={item}/>}
                    searchOptions={this.state.searchOptions}
                />
            </View>
        )
    }
}


const styles1 = StyleSheet.create({
    searchBar: {
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: LINEUP_PADDING, backgroundColor: NAV_BACKGROUND_COLOR
    }
})
