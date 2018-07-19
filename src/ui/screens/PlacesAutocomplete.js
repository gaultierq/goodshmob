import React from 'react'
import {Image, Text, View} from 'react-native'
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete'
import Screen from "../components/Screen"
import Config from 'react-native-config'
import * as UI from "../UIStyles"
import {NavStyles, SEARCH_INPUT_PROPS, SEARCH_STYLES, styleMargin, stylePadding} from "../UIStyles"
import {SEARCH_OPTIONS_PADDINGS} from "./search/searchplacesoption"
import {Colors} from "../colors"

// const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
// const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};


export type Props = {
    onPlaceSelected: (data, details) => void
};

export type State = {
};


export default class PlacesAutocomplete extends Screen<Props, State> {

    static navigatorStyle = {
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true,
    };

    constructor(props) {
        super(props);
        props.navigator.setStyle({...UI.NavStyles,
            navBarNoBorder: true,
            topBarElevationShadowEnabled: false,

            navBarCustomViewInitialProps: {
                initialInput: props.token,
                placeholder: props.placeholder,
                autoFocus: false,
                editable: false,
            }
        });

    }

    render() {
        return (
            <View style={{width: "100%", height: "100%", backgroundColor: 'transparent', }}>
                <PlacesAutocomplete.GooglePlacesInput onPlaceSelected={this.props.onPlaceSelected} />
            </View>
        );

    }


    static GooglePlacesInput = (props) => {
        return (
            <GooglePlacesAutocomplete
                minLength={2} // minimum length of text to search
                autoFocus={true}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed='auto'    // true/false/undefined
                fetchDetails={true}
                renderDescription={row => row.description} // custom description render
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                    console.log(data, details);
                    props.onPlaceSelected(data, details);

                }}

                getDefaultValue={() => ''}

                query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: Config.GOOGLE_PLACES_API_KEY,
                    language: 'en', // language of the results
                    // types: '(cities)' // default: 'geocode'
                    // types: '(address,cities)' // default: 'geocode'
                }}

                styles={{
                    container: {
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        marginBottom: 10,
                        backgroundColor: 'transparent',

                    },
                    textInputContainer: {
                        width: '100%',
                        backgroundColor: NavStyles.navBarBackgroundColor,
                        borderTopWidth: 0,
                        // borderBottomWidth: 0,

                        ...SEARCH_OPTIONS_PADDINGS,


                        // backgroundColor: 'red',
                        // paddingVertical: 180,
                        // marginBottom: 15,
                        paddingBottom: 55
                    },
                    textInput: [SEARCH_STYLES.searchInput, {
                        ...styleMargin(0,0),
                        ...stylePadding(10,0),
                    }],
                    description: {
                        fontWeight: 'bold'
                    },
                    predefinedPlacesDescription: {
                        color: Colors.black
                    }
                }}

                currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                currentLocationLabel={i18n.t('current_location')}
                nearbyPlacesAPI='None' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                    // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                    // types: 'food'
                }}

                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                // predefinedPlaces={[homePlace, workPlace]}

                debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                // renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
                // renderRightButton={() => <Text>Custom text after the input</Text>}
                {...SEARCH_INPUT_PROPS}
                placeholder={"Paris, London, New-York..."}
            />
        );
    };
}
