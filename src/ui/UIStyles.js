//@flow
import {Linking, StyleSheet, Text, TouchableOpacity, Platform} from 'react-native';
import Button from 'apsl-react-native-button'
import * as React from "react";
import {toUppercase} from "../helpers/StringUtils";
import {Colors, SEARCH_PLACEHOLDER_COLOR} from "./colors";
import {SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "./fonts";
import GTouchable from "./GTouchable";

export const BACKGROUND_COLOR = Colors.dirtyWhite2;

export const NavStyles = {
    navBarButtonColor: Colors.greyishBrown,
    navBarBackgroundColor: Colors.dirtyWhite,
    navBarTextFontSize: 17,
    navBarSubtitleFontSize: 14,
    navBarSubtitleColor: Colors.brownishGrey,
    navBarSubtitleFontFamily: SFP_TEXT_MEDIUM,
    navBarTitleFontSize: 17,
    navBarTextFontFamily: SFP_TEXT_MEDIUM,
    navBarTitleFontFamily: SFP_TEXT_MEDIUM,
    navBarInputBackgroundColor: Colors.greying,
    screenBackgroundColor: BACKGROUND_COLOR,
    // screenBackgroundColor: '#AEAEAE'
};

export const SearchStyles = {
    screenBackgroundColor: 'rgba(0,0,0,0.3)',
    modalPresentationStyle: 'overCurrentContext',
    topBarElevationShadowEnabled: false
};


//http://colormind.io/
export const RandomColors = Object.freeze([
        '#83DB5E',
        '#EEAC82',
        '#E36995',
        '#5F2C60',
        '#26547C',
        '#EF476F',
        '#FFD166',
        // '#FCFCFC',
        '#FF8360',
        '#E8E288',
        '#7DCE82',
        '#F0D2D1',
    ]
);

let styleLTRB = function (args, method) {


    if (args[0] != null && args[2] == null) args[2] = args[0];
    if (args[1] != null && args[3] == null) args[3] = args[1];


    return ['left', 'top', 'right', 'bottom'].reduce((res, p, i) => {
        let arg = args[i];

        if (arg != null) {
            let newVar;
            if (typeof method === 'string') {
                newVar = method + toUppercase(p);
            }
            else {
                newVar = method(p);
            }


            Object.assign(res, {[newVar]: arg});
        }
        return res;
    }, {});
};

//stylePadding(12, null) => left = righ = 12
//stylePadding(12, 14) => left = righ = 12
export function stylePadding(left?: number, top?: number, right?: number, bottom?: number) {
    return styleLTRB(arguments, "padding");
}

export function styleMargin(left?: number, top?: number, right?: number, bottom?: number) {
    return styleLTRB(arguments, "margin");
}

//TODO: convert to stylesheet
export const TEXT_LIST = {fontSize: 14, color: Colors.blue};
export const TEXT_LESS_IMPORTANT = {fontSize: 12, color: Colors.greyish};
export const TEXT_LEAST_IMPORTANT = {fontSize: 9, color: Colors.greyish};

export const LINEUP_PADDING = 15

type ButtonOptions = {disabled?: boolean, loading?: boolean, style?: *};

export function renderSimpleButton(
    text: string,
    onPress: ()=> void ,
    {disabled = false, loading = false, style = {}, textStyle = {}} : ButtonOptions = {}) {

    return (
        <Button
            isLoading={loading}
            isDisabled={disabled}
            onPress={onPress}
            style={[{marginBottom: 0}, STYLES.button, style]}
            disabledStyle={STYLES.disabledButton}
        >
            <Text style={[{fontWeight: "bold", fontSize: 18}, textStyle, ]}>{text}</Text>
        </Button>
    );
}

export function renderSimpleLink(
    text: string,
    onPress: ()=> void ,
    options :? ButtonOptions) {
    let {disabled = false, loading = false, style = {}} = options || {};

    let color = disabled ? Colors.greyishBrown : Colors.blue;

    return (
        <GTouchable onPress={disabled ? null : onPress}>
            <Text style={[{color}, style]}>{text}</Text>
        </GTouchable>
    );
}

export function renderLink(
    text: string,
    url: string,
    options:? ButtonOptions) {

    let handler = ()=> {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        })};

    return renderSimpleLink(text, handler, options);
}
export function openLinkSafely(url: string) {
    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url);
        } else {
            console.log("Don't know how to open URI: " + url);
        }
    })
}

export const STYLES = StyleSheet.create({
    button: {
        padding: 0,
        borderColor: "transparent",
    },
    disabledButton: {
        borderColor: "transparent",
        opacity: .6
    },
    lightBorder: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyish,
    },
    empty_message: {
        fontSize: 18,
        margin: '10%',
        textAlign: 'center',
        fontFamily: SFP_TEXT_REGULAR
    },
    tag: {
        paddingLeft: 8, paddingRight: 8,
        color: Colors.greyish,
        alignSelf: 'stretch',
        borderRadius: 10,
        height: 22,
        lineHeight: 20,
        textAlignVertical: 'center',
        // padding: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyish,
        fontFamily: SFP_TEXT_ITALIC,
        fontSize: 15,

    },
    tag2: {
        paddingLeft: 6, paddingRight: 6,

        alignSelf: 'stretch',
        borderRadius: 8,
        height: 16,

        textAlignVertical: 'center',
        // padding: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyish,

        color: Colors.greyish,
        fontFamily: SFP_TEXT_ITALIC,
        fontSize: 10,
        lineHeight: 10
    },
    apslInit: {
        borderWidth: 0,
        marginBottom: 0,
        borderRadius: 0,
    },
    FULL_SCREEN: {
        flex:1,
        width: "100%",
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.65)'
    },
    SECTION_TITLE: {
        fontSize: 20,
        fontFamily: SFP_TEXT_MEDIUM
    }
});

export const FEED_INITIAL_LOADER_DURATION = 400;


export const SEARCH_INPUT_RADIUS = 4;

export const SEARCH_STYLES_OBJ = {
    container: {
        flex: 1,
    },
    //copied: rm useless
    searchContainer: {
        backgroundColor: NavStyles.navBarBackgroundColor,
        borderTopColor: 'transparent',
        borderBottomWidth: 0, borderTopWidth: 0,
    },
    searchInput: {
        backgroundColor: Colors.greying,//NavStyles.navBarBackgroundColor,
        // backgroundColor: 'red',//NavStyles.navBarBackgroundColor,
        fontSize: 15,
        height: 40,
        ...Platform.select({
            ios: {
                height: 30,

            },
            android: {
                borderWidth: 0,
            },
        }),
        color: Colors.brownishGrey,
        borderRadius: SEARCH_INPUT_RADIUS,
    },
};

export const SEARCH_STYLES = StyleSheet.create(SEARCH_STYLES_OBJ);


export const SEARCH_INPUT_PROPS = {
    placeholderTextColor: SEARCH_PLACEHOLDER_COLOR,
    selectionColor: Colors.black,
    autoCapitalize: 'none',
    autoCorrect: false,
    returnKeyType: 'search',
    underlineColorAndroid: 'transparent'
};


let TAB_BAR_STYLES = StyleSheet.create({
    tabbar: {
        // backgroundColor: Colors.white,
        backgroundColor: NavStyles.navBarBackgroundColor,
    },
    indicator: {
        backgroundColor: Colors.green,
    },
    tab: {
        opacity: 1,
        //width: 90,
    },
    label: {
        color: '#000000',
    },

})

export const TAB_BAR_PROPS = {
    indicatorStyle: TAB_BAR_STYLES.indicator,
    style: TAB_BAR_STYLES.tabbar,
    tabStyle: TAB_BAR_STYLES.tab,
    labelStyle: TAB_BAR_STYLES.label,
}

