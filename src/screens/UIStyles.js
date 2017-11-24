//@flow
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import Button from 'apsl-react-native-button'
import * as React from "react";

export const NavStyles = Object.freeze({
    navBarButtonColor: 'black',
});

export const Colors = Object.freeze({
    black: '#000000',
    blue: '#408be7',
    grey1: '#767676',
    grey2: '#AAAAAA',
    grey3: '#CCCCCC',
    green: '#1ec',
    white: '#fff'
});

export const CARD = (sideMargin: number = 12) => {
    return {
        backgroundColor: "white",
        marginLeft: sideMargin,
        marginRight: sideMargin,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: {width: 2, height: 2},
        borderRadius: 4,
        shadowRadius: 2,
        elevation: 2,
        marginTop: 5,
        marginBottom: 5
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


//TODO: convert to stylesheet
export const TEXT_LIST = {fontSize: 14, color: Colors.blue};
export const TEXT_LESS_IMPORTANT = {fontSize: 12, color: Colors.grey2};
export const TEXT_LEAST_IMPORTANT = {fontSize: 9, color: Colors.grey2};

type ButtonOptions = {disabled?: boolean, loading?: boolean, style?: *};

export function renderSimpleButton(
    text: string,
    onPress: ()=> void ,
    {disabled = false, loading = false, style = {}} : ButtonOptions = {}) {

    let color = disabled ? Colors.grey1 : Colors.black;

    return (<Button
        isLoading={loading}
        isDisabled={disabled}
        onPress={onPress}
        style={[styles.button, style]}
        disabledStyle={styles.disabledButton}
    >
        <Text style={{color, backgroundColor: "transparent"}}>{text}</Text>
    </Button>);
}

export function renderSimpleLink(
    text: string,
    onPress: ()=> void ,
    {disabled = false, loading = false, style = {}} : ButtonOptions) {

    let color = disabled ? Colors.grey1 : Colors.blue;

    return (<TouchableOpacity onPress={disabled ? null : onPress}>
        <Text style={[{color}, style]}>{text}</Text>
    </TouchableOpacity>);
}


const styles = StyleSheet.create({
    button: {
        padding: 8,
        borderColor: "transparent",
    },
    disabledButton: {
        borderColor: "transparent"
    }
});
