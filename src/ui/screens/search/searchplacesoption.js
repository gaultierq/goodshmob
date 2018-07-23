// @flow
import type {Node} from 'react'
import React, {Component} from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import {CheckBox} from 'react-native-elements'
import GTouchable from "../../GTouchable"
import {Colors} from "../../colors"
import {
    NavStyles,
    renderSimpleButton,
    SEARCH_INPUT_PROPS,
    SEARCH_INPUT_RADIUS,
    SEARCH_STYLES,
    SEARCH_STYLES_OBJ
} from "../../UIStyles"
import Icon from 'react-native-vector-icons/MaterialIcons'
import {Navigation} from 'react-native-navigation'
import {CANCELABLE_SEARCH_MODAL} from "../../Nav"
import type {RNNNavigator} from "../../../types"
import OpenAppSettings from "react-native-app-settings"
import Geolocation from "../../../managers/GeoLocation"
import Permissions from 'react-native-permissions'


export type GeoStatus = {
    lat?: number,
    lng?: number,
    permissionError: string | null
}

export type SearchPlacesProps = {
    aroundMe?:boolean,
    onNewOptions: GeoStatus => void,
    onSearchSubmited?: void => void,
    navigator: RNNNavigator,
    ref?: IPositionSelector => void,

};

type SearchPlacesState = {
    aroundMe: boolean,
    place: string,
    focus: boolean,

    lat?: ?number,
    lng?: ?number
};

export const SEARCH_OPTIONS_PADDINGS = {

    paddingLeft: __IS_IOS__ ? 16 : 16,
    paddingRight: __IS_IOS__ ? 16 : 16,
    paddingVertical: 8,
};


//search query KEY: token x category x options
export interface IPositionSelector {
    getPosition(): Promise<GeoStatus>;
}

export class SearchPlacesOption extends Component<SearchPlacesProps, SearchPlacesState> implements IPositionSelector {

    input;
    animation;

    static defaultProps = {
        aroundMe: true,
    };

    constructor(props) {
        super(props);
        const aroundMe = !!props.aroundMe;
        this.state = {aroundMe};
        this.animation = new Animated.Value(1);
        this.toggleAroundMe(aroundMe);
    }

    componentDidMount() {
        if (this.props.ref) {
            this.props.ref(this)
        }
        this.setStateAndNotify(this.state)
    }

    render() {

        const radius = SEARCH_INPUT_RADIUS;
        const inputFlex = this.animation.interpolate({inputRange: [0, 1], outputRange: [1, 0]});
        const inputAroundMe = this.animation.interpolate({inputRange: [0, 1], outputRange: [0, 1]});
        const opacity = this.animation.interpolate({inputRange: [0, 1], outputRange: [0, 1]});
        const paddingLeft = this.animation.interpolate({inputRange: [0, 1], outputRange: [10, 0]});
        const color2 = this.animation.interpolate({inputRange: [0, 1], outputRange: ['rgba(235, 235, 235, 1)', 'rgba(235, 235, 235, 0)']});
        const radius2 = this.animation.interpolate({inputRange: [0, 1], outputRange: [radius, 0]});


        const darkerBackgroundColor = "#E1E1E1";
        const lighterBackgroundColor = _.get(SEARCH_STYLES_OBJ, 'searchInput.backgroundColor') || Colors.greying;


        return (
            <View style={{
                backgroundColor: NavStyles.navBarBackgroundColor,
                flex: 0,
                flexDirection: 'row',

                ...SEARCH_OPTIONS_PADDINGS
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
                            backgroundColor: lighterBackgroundColor,
                            borderTopLeftRadius: radius,
                            borderBottomLeftRadius: radius,
                            paddingHorizontal: paddingLeft,
                        }}>
                            <GTouchable
                                // style={{backgroundColor:'red'}}
                                onPress={()=>{
                                    const navigator = this.props.navigator;
                                    navigator.showModal({
                                        screen: 'goodsh.PlacesAutocomplete',
                                        navigatorButtons: CANCELABLE_SEARCH_MODAL(),
                                        animationType: 'none',
                                        passProps: {
                                            onPlaceSelected: (data, details) => {
                                                const place = data.description;
                                                if (place === 'Current location') {
                                                    // this.setStateAndNotify({
                                                    //     aroundMe: true,
                                                    // });
                                                    this.toggleAroundMe(true)
                                                }
                                                else {
                                                    let {lat, lng} = _.get(details, 'geometry.location', {});

                                                    this.setStateAndNotify({
                                                        place: place,
                                                        aroundMe: false,
                                                        lat,
                                                        lng
                                                    });
                                                }

                                                // Navigation.dismissModal({animationType: 'none',});
                                                navigator.dismissModal({animationType: 'none'});
                                            },
                                            onClickClose: () => {
                                                navigator.dismissModal({animationType: 'none'});
                                            }
                                        }
                                    });
                                }}>
                                <View pointerEvents='none'>
                                    <TextInput
                                        editable={false}
                                        ref={input=>this.input = input}
                                        onSubmitEditing={() => this.props.onSearchSubmited()}
                                        onClearText={() => this.setStateAndNotify({place: "", lat: "", lng: ""})}

                                        onFocus={()=>this.setState({focus:true})}
                                        onBlur={()=>this.setState({focus:false})}
                                        // placeholderTextColor={SEARCH_PLACEHOLDER_COLOR}
                                        placeholder={"Paris, London, New-York..."}
                                        {...SEARCH_INPUT_PROPS}
                                        style={[SEARCH_STYLES.searchInput,]}
                                        value={this.state.place}
                                        onChangeText={place=> {
                                            this.setStateAndNotify({place})
                                        }}
                                    />
                                </View>
                            </GTouchable>
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
                            backgroundColor: darkerBackgroundColor,
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
                        backgroundColor: darkerBackgroundColor,
                        // marginRight: 18,
                        // backgroundColor: 'red',
                        borderTopRightRadius: radius,
                        borderBottomRightRadius: radius,
                    }}>


                        <Text
                            numberOfLines={1}
                            style={{
                                color: Colors.brownishGrey,
                                flex: 1,
                                backgroundColor: 'transparent',
                            }}>{i18n.t("search_item_screen.search_options.around_me")}

                        </Text>



                    </Animated.View>

                    {/*cross*/}
                    <Animated.View
                        style={{
                            // flex: 0,
                            position: 'absolute',
                            right: 0,
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
                            style={{
                                padding: 12
                            }}
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
                easing: Easing.cubic,
                duration: 400,

            }
        ).start();

    }

    async setStateAndNotify(newState: SearchPlacesState) {
        await this.setState(newState)

        this.getPosition()
            .then(geoPosition => {
                this.props.onNewOptions(geoPosition)
            })

    }

    getPosition(): Promise<GeoStatus> {
        let {lat, lng, aroundMe} = this.state
        let geoPosition: GeoStatus
        if (aroundMe) {
            return getCurrentGeoStatus()
        } else {
            geoPosition = {lat, lng, permissionError: null}
            return Promise.resolve(geoPosition)
        }
    }

}

//
function getCurrentGeoStatus(): Promise<GeoStatus> {
    let geoPosition: GeoStatus
    return Permissions.check('location').then(response => {

        if (response !== 'authorized') {
            geoPosition = {permissionError: response}
            return Promise.resolve(geoPosition)
        } else {
            return Geolocation.getPosition()
                .then(position => {
                    geoPosition = {lat: position.latitude,
                        lng: position.longitude,
                        permissionError: null}
                    return geoPosition
                })
        }
    })
}

function askPermission(onUpdatedPosition: GeoStatus => void) {
    Permissions.request('location')
        .then((res)=> {
            getCurrentGeoStatus()
                .then(position => {
                    onUpdatedPosition(position)
                })
        })
}

export function renderAskPermission(permissionError: string, onUpdatedPosition: GeoStatus => void): Node {
    return <View>
        <Text>{i18n.t("search.category.missing_permission")}</Text>

        {permissionError === 'denied' && <Text>{i18n.t("search.category.settings_permission")}</Text>}
        {permissionError === 'denied' && renderSimpleButton(i18n.t("search.category.retry"), () => askPermission(onUpdatedPosition))}
        {permissionError === 'undetermined' && renderSimpleButton(i18n.t("search.category.authorize"), () => askPermission(onUpdatedPosition))}
    </View>
}

