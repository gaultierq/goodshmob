//@flow
import {Linking, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Button from 'apsl-react-native-button'
import * as React from "react";
import {toUppercase} from "../helpers/StringUtils";
import {Colors} from "./colors";
import {SFP_TEXT_MEDIUM} from "./fonts";
import GTouchable from "./GTouchable";

export const NavStyles = {
    navBarButtonColor: Colors.greyishBrown,
    navBarBackgroundColor: Colors.dirtyWhite,
    navBarTextFontSize: 18,
    navBarTextFontFamily: SFP_TEXT_MEDIUM,
    navBarInputBackgroundColor: Colors.greying
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


export const CARD = (sideMargin: number = 12) => {
    return CARD2();
    // return {
    //     backgroundColor: "white",
    //     marginLeft: sideMargin,
    //     marginRight: sideMargin,
    //     shadowColor: "#000",
    //     shadowOpacity: 0.3,
    //     shadowOffset: {width: 2, height: 2},
    //     borderRadius: 4,
    //     shadowRadius: 2,
    //     elevation: 2,
    //     marginTop: 5,
    //     marginBottom: 5
    // }
};

export const CARD2 = (sideMargin: number = 0) => {
    return {
        backgroundColor: "white",
        marginLeft: sideMargin,
        marginRight: sideMargin,
        // shadowColor: "#000",
        // shadowOpacity: 0.3,
        // shadowOffset: {width: 2, height: 2},
        // borderRadius: 4,
        // shadowRadius: 2,
        // elevation: 2,
        // marginTop: 5,
        // marginBottom: 5
    }
};

export const SIDE_MARGINS = (margin) => {
    return {
        marginLeft: margin,
        marginRight: margin,
    }
};
export const TP_MARGINS = (margin) => {
    return {
        marginTop: margin,
        marginBottom: margin,
    }
};

//stylePadding(12, null) => left = righ = 12
//stylePadding(12, 14) => left = righ = 12
export function stylePadding(left?: number, top?: number, right?: number, bottom?: number) {

    const method = "padding";
    const args = arguments;

    let styleLTRB = function () {


        if (args[0] != null && args[2] == null) args[2] = args[0];
        if (args[1] != null && args[3] == null) args[3] = args[1];


        return ['left', 'top', 'right', 'bottom'].reduce((res, p, i) => {
            let arg = args[i];
            if (arg != null) {
                Object.assign(res, {[method + toUppercase(p)]: arg});
            }
            return res;
        }, {});
    };
    return styleLTRB();
}



//TODO: convert to stylesheet
export const TEXT_LIST = {fontSize: 14, color: Colors.blue};
export const TEXT_LESS_IMPORTANT = {fontSize: 12, color: Colors.greyish};
export const TEXT_LEAST_IMPORTANT = {fontSize: 9, color: Colors.greyish};


type ButtonOptions = {disabled?: boolean, loading?: boolean, style?: *};

export function renderSimpleButton(
    text: string,
    onPress: ()=> void ,
    {disabled = false, loading = false, style = {}, textStyle = {}} : ButtonOptions = {}) {

    let color = disabled ? Colors.greyishBrown : Colors.black;

    return (<Button
        isLoading={loading}
        isDisabled={disabled}
        onPress={onPress}
        style={[{marginBottom: 0}, STYLES.button, style]}
        disabledStyle={STYLES.disabledButton}
    >
        <Text style={[{color, fontWeight: "bold", fontSize: 18}, textStyle]}>{text}</Text>
    </Button>);
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
        borderColor: "transparent"
    },
    lightBorder: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.greyish,
    }
});
