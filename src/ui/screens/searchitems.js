// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import * as Api from "../../managers/Api";
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
import {Call} from "../../managers/Api";
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        console.debug(`api: searching: token='${token}', category='${category}', page=${page}, options=${options}`);

        return new Promise((resolve, reject) => {

            //actions.searchFor(this.state.input, cat)

            let call = new Api.Call()
                .withMethod('GET')
                .withRoute(`search/${category}`)
                .addQuery({'search[term]': token});


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

    fillOptions(category: SearchCategoryType, call: Call, options: any) {
        return new Promise((resolve, reject) => {
            if (category === 'places' && options) {
                if (options.aroundMe) {
                    Geolocation.getPosition().then(({latitude, longitude}) => {
                        call.addQuery(latitude && {'search[lat]': latitude})
                            .addQuery(longitude && {'search[lng]': longitude});
                        resolve(call);
                    }, err => reject(err));
                }
                else {
                    if (!_.isEmpty(options.city)) {
                        call.addQuery({'search[city]': options.city});
                    }
                    resolve(call);
                }
            }
            else {
                resolve(call);
            }
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

    input;

    constructor(props) {
        super(props);
        this.state = {aroundMe: !!props.aroundMe};
        props.onNewOptions(this.state);
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


    render() {

        return (
            <View style={{
                backgroundColor: NavStyles.navBarBackgroundColor,
                flex: 0,
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingVertical: 8,
            }}>

                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    backgroundColor: Colors.greying,
                    borderRadius: 3,
                    paddingHorizontal: 10,
                }}>
                    {/* input block */}
                    <View style={{
                        flex: this.state.aroundMe ? 0 : 1,
                        flexDirection: 'row',
                        marginHorizontal: this.state.aroundMe ? 0 : 8,
                        // backgroundColor: 'green'
                    }}>
                        <TextInput
                            ref={input=>this.input = input}
                            onSubmitEditing={() => this.props.onSearchSubmited()}
                            onClearText={() => this.setStateAndNotify({city: ""})}
                            placeholder={"Paris, London, New-York..."}
                            onFocus={()=>this.setState({focus:true})}
                            onBlur={()=>this.setState({focus:false})}
                            style={[{
                                flex: 1,
                                marginVertical: 4,
                                // marginHorizontal: 8,

                                fontSize: 15,
                                backgroundColor: 'transparent',
                                // backgroundColor: 'purple',

                            },
                                // SEARCH_STYLES.searchInput
                            ]}
                            autoCapitalize='none'
                            autoCorrect={false}
                            returnKeyType={'search'}
                            value={this.state.city}
                        />
                    </View>

                    <View style={{
                        flex: this.state.aroundMe ? 1 : 0,
                        alignItems: 'center',
                        flexDirection: 'row',
                        // backgroundColor: NavStyles.navBarBackgroundColor,
                        // backgroundColor: 'red',



                    }}>
                        <GTouchable
                            style={{
                                // flex: 1,
                                // margin: 5,
                                // backgroundColor: 'yellow'
                            }}
                            onPress={()=>{
                                this.setStateAndNotify({aroundMe: true});
                            }}>
                            <Icon name="gps-fixed" size={18} color={Colors.greyishBrown}/>
                        </GTouchable>
                        <Text style={{
                            flex: 10,
                            alignItems: 'center',
                            marginLeft: 6,
                        }}>{i18n.t("search_item_screen.search_options.around_me")}</Text>
                        { this.state.aroundMe &&
                        <GTouchable
                            style={{
                                // flex: 0.1,
                                // padding: 5
                                // backgroundColor: 'yellow'
                            }}

                            onPress={()=>{
                                this.setStateAndNotify({aroundMe: false});
                            }}>
                            <Icon name="close" size={15} color={Colors.greyishBrown}
                                // style={{flex:1}}
                            />
                        </GTouchable>
                        }

                    </View>
                </View>
            </View>
        );
    }

    setStateAndNotify(newState) {
        this.setState(newState, () => this.props.onNewOptions(this.state));
    }
}