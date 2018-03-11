// @flow

import React, {Component} from 'react';
import {Animated, ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
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
import {Colors, SEARCH_PLACEHOLDER_COLOR} from "../colors";
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
    animation;


    constructor(props) {
        super(props);
        this.state = {aroundMe: !!props.aroundMe};
        this.animation = new Animated.Value(0);
        props.onNewOptions(this.state);
    }

    // render() {
    //     return (
    //         <View style={{backgroundColor: NavStyles.navBarBackgroundColor, padding: 12}}>
    //
    //             <SearchBar
    //                 // autoFocus
    //                 lightTheme
    //                 onChangeText={city=> {
    //                     this.setStateAndNotify({city})
    //                 }}
    //                 onSubmitEditing={() => this.props.onSearchSubmited()}
    //                 onClearText={() => this.setStateAndNotify({city: ""})}
    //                 placeholder={this.state.focus ? "Paris, London, New-York..." : i18n.t("search_item_screen.search_options.around_me")}
    //                 clearIcon={!!this.state.input && {color: '#86939e'}}
    //                 icon={{ type: 'font-awesome', name: 'gps-fixed' }}
    //                 onFocus={()=>this.setState({focus:true})}
    //                 onBlur={()=>this.setState({focus:false})}
    //                 containerStyle={[SEARCH_STYLES.searchContainer]}
    //                 inputStyle={{backgroundColor: Colors.dirtyWhite2}}
    //                 autoCapitalize='none'
    //                 autoCorrect={false}
    //                 returnKeyType={'search'}
    //                 value={this.state.city}
    //             />
    //
    //
    //
    //         </View>
    //     );
    // }


    render() {

        const radius = 4;
        const inputFlex = this.animation.interpolate({inputRange: [0, 1], outputRange: [1, 0]});
        const inputAroundMe = this.animation.interpolate({inputRange: [0, 1], outputRange: [0, 1]});
        const opacity = this.animation.interpolate({inputRange: [0, 1], outputRange: [0, 1]});
        const paddingLeft = this.animation.interpolate({inputRange: [0, 1], outputRange: [10, 0]});
        const color2 = this.animation.interpolate({inputRange: [0, 1], outputRange: ['rgba(235, 235, 235, 1)', 'rgba(235, 235, 235, 0)']});
        const radius2 = this.animation.interpolate({inputRange: [0, 1], outputRange: [radius, 0]});


        const backgroundColor = Colors.grey4;

        return (
            <View style={{
                backgroundColor: NavStyles.navBarBackgroundColor,
                flex: 0,
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingVertical: 8,
            }}>

                <Animated.View style={{
                    flex: 1,
                    flexDirection: 'row',
                    // paddingLeft,
                    // paddingHorizontal: 4,
                }}>
                    {/* input block */}
                    <Animated.View style={{
                        flex: inputFlex,
                        flexDirection: 'row',

                    }}>

                        <Animated.View style={{
                            flex: 1,
                            // paddingVertical: 4,
                            backgroundColor: Colors.greying,
                            borderTopLeftRadius: radius,
                            borderBottomLeftRadius: radius,
                            paddingHorizontal: paddingLeft,
                        }}>
                            <TextInput
                                ref={input=>this.input = input}
                                onSubmitEditing={() => this.props.onSearchSubmited()}
                                onClearText={() => this.setStateAndNotify({city: ""})}
                                placeholder={"Paris, London, New-York..."}
                                onFocus={()=>this.setState({focus:true})}
                                onBlur={()=>this.setState({focus:false})}
                                placeholderTextColor={SEARCH_PLACEHOLDER_COLOR}
                                style={[
                                    SEARCH_STYLES.searchInput,
                                ]}
                                autoCapitalize='none'
                                autoCorrect={false}
                                returnKeyType={'search'}
                                value={this.state.city}
                                onChangeText={city=> {
                                    this.setStateAndNotify({city})
                                }}
                            />
                        </Animated.View>

                    </Animated.View>


                    <Animated.View style={{
                        // flex: 0,
                        zIndex: 1,
                        // flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: color2,
                        borderTopRightRadius: radius,
                        borderBottomRightRadius: radius,
                    }}>
                        <Animated.View style={{
                            flex: 1,
                            zIndex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            backgroundColor: backgroundColor,
                            borderTopLeftRadius: radius,
                            borderBottomLeftRadius: radius,
                            borderRadius: radius2,

                            // backgroundColor: 'pink',
                        }}>
                            <GTouchable

                                onPress={()=>{
                                    this.toggleAroundMe(true);
                                }}>
                                <Icon name="gps-fixed" size={18} color={Colors.greyishBrown}/>
                            </GTouchable>

                        </Animated.View>
                    </Animated.View>
                    {/* text */}
                    <Animated.View style={{
                        flex: inputAroundMe,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: backgroundColor,
                        // marginRight: 18,
                        // backgroundColor: 'red',
                        borderTopRightRadius: radius,
                        borderBottomRightRadius: radius,
                    }}>


                        <Text
                            numberOfLines={1}
                            style={{
                                flex: 1,
                                singleLine: true,
                                backgroundColor: 'transparent',
                            }}>{i18n.t("search_item_screen.search_options.around_me")}

                        </Text>



                    </Animated.View>

                    {/*cross*/}
                    <Animated.View
                        style={{
                            // flex: 0,
                            position: 'absolute',
                            right: 8,
                            zIndex: 0,
                            alignSelf: 'center',
                            // flexDirection: 'row',
                            opacity,
                            // alignItems: 'center',
                            backgroundColor: 'transparent',
                            // backgroundColor: 'red',
                        }}
                    >
                        <GTouchable
                            onPress={()=>{
                                this.toggleAroundMe(false);
                            }}>
                            <Icon name="close" size={15} color={Colors.greyishBrown}
                                // style={{flex:1}}
                            />
                        </GTouchable>
                    </Animated.View>



                </Animated.View>
            </View>
        );
    }

    toggleAroundMe(aroundMe: boolean) {
        this.setStateAndNotify({aroundMe});
        Animated.timing(
            this.animation,
            {
                toValue: aroundMe ? 1 : 0,
                duration: 400,

            }
        ).start();

    }

    setStateAndNotify(newState) {
        this.setState(newState, () => this.props.onNewOptions(this.state));
    }
}