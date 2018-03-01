// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import * as Api from "../../managers/Api";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import ItemCell from "../components/ItemCell";
import {buildData} from "../../helpers/DataUtils";
import {CheckBox, SearchBar} from 'react-native-elements'
import type {SearchCategoryType} from "./search";
import SearchScreen from "./search";
import normalize from 'json-api-normalizer';
import GTouchable from "../GTouchable";
import Screen from "../components/Screen";
import type {Item, RNNNavigator} from "../../types";
import {Colors} from "../colors";
import Geolocation from "../../managers/GeoLocation"
import {SFP_TEXT_REGULAR} from "../fonts";
import {NavStyles} from "../UIStyles";

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


    getSearchOptions(category: SearchCategoryType) {
        return category === 'places' && {
            renderOptions: (currentOptions: any, onNewOptions: SearchPlacesProps) => (
                <SearchPlacesOption
                    {...currentOptions}
                    onNewOptions={onNewOptions}
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
                searchOptions: this.getSearchOptions(categ)

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

    search(token: SearchToken, category: SearchCategoryType, page: number, options: ?any): Promise<*> {

        //searching
        console.log(`api: searching ${token}`);

        return new Promise((resolve, reject) => {

            //actions.searchFor(this.state.input, cat)

            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`)
                .addQuery({'search[term]': token});


            if (category === 'places' && options && options.aroundMe) {
                let {latitude, longitude} = category === 'places' && Geolocation.getPosition() || {};
                call.addQuery(latitude && {'search[lat]': latitude})
                    .addQuery(longitude && {'search[lng]': longitude})
            }
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

type SearchPlacesProps = {
    aroundMe: ?boolean,
    onNewOptions: any => void
};

type SearchPlacesState = {
    aroundMe: boolean
};

class SearchPlacesOption extends Component<SearchPlacesProps, SearchPlacesState> {

    constructor(props) {
        super(props);
        this.state = {aroundMe: !!props.aroundMe};
    }

    render() {
        return (
            <View style={{backgroundColor: NavStyles.navBarBackgroundColor, padding: 12}}>
                <CheckBox
                    right
                    title={i18n.t("search_item_screen.search_options.around_me")}
                    // checkedTitle={i18n.t("create_list_controller.visible")}
                    iconRight
                    size={20}
                    onPress={something=> {
                        this.setStateAndNotify({aroundMe: !this.state.aroundMe})
                    }}
                    checked={this.state.aroundMe}
                    style={{alignSelf: 'flex-end'}}
                    textStyle={{color: Colors.brownishGrey, fontSize: 14, fontFamily: SFP_TEXT_REGULAR, fontWeight: 'normal'}}
                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginRight:0, padding: 0, flex: 1}}
                    checkedIcon='map-marker'
                    uncheckedIcon='map-marker'
                    checkedColor={Colors.brownishGrey}
                    uncheckedColor={Colors.greyish}
                />
            </View>
        );
    }

    setStateAndNotify(newState) {
        this.setState(newState, () => this.props.onNewOptions(this.state));
    }
}