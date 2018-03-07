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
import {NavStyles, SEARCH_STYLES} from "../UIStyles";

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


            if (category === 'places') {
                if (options) {
                    if (!_.isEmpty(options.city)) {
                        call.addQuery({'search[city]': options.city})
                    }
                    else {
                        let {latitude, longitude} = Geolocation.getPosition() || {};
                        call.addQuery(latitude && {'search[lat]': latitude})
                            .addQuery(longitude && {'search[lng]': longitude})
                    }
                }

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
    onNewOptions: any => void,
    onSearchSubmited: void => void
};

type SearchPlacesState = {
    aroundMe: boolean,
    city: string,
    focus: boolean
};

class SearchPlacesOption extends Component<SearchPlacesProps, SearchPlacesState> {

    constructor(props) {
        super(props);
        this.state = {aroundMe: !!props.aroundMe};
    }

    render() {
        return (
            <View style={{backgroundColor: NavStyles.navBarBackgroundColor, padding: 12}}>

                <SearchBar
                    // autoFocus
                    lightTheme
                    onChangeText={city=> {
                        this.setStateAndNotify({city})
                    }}
                    onSubmitEditing={() => this.props.onSearchSubmited()}
                    onClearText={() => this.setStateAndNotify({city: ""})}
                    placeholder={this.state.focus ? "Paris, London, New-York..." : i18n.t("search_item_screen.search_options.around_me")}
                    clearIcon={!!this.state.input && {color: '#86939e'}}
                    icon={{ type: 'font-awesome', name: 'gps-fixed' }}
                    onFocus={()=>this.setState({focus:true})}
                    onBlur={()=>this.setState({focus:false})}
                    containerStyle={[SEARCH_STYLES.searchContainer]}
                    inputStyle={{backgroundColor: Colors.dirtyWhite2}}
                    autoCapitalize='none'
                    autoCorrect={false}
                    returnKeyType={'search'}
                    value={this.state.city}
                />

            </View>
        );
    }

    setStateAndNotify(newState) {
        this.setState(newState, () => this.props.onNewOptions(this.state));
    }
}