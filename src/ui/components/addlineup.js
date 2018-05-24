// @flow

import React, {Component} from 'react';
import {Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"

import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import type {RNNNavigator} from "../../types";


type Props = {
    navigator: RNNNavigator,
    disableOffline?: ?boolean,
    onListCreated?: ()=>void,
    style?: *,
    styleText?: *,
};

type State = {
};


@connect()
@logged
export default class AddLineupComponent extends Component<Props, State> {

    state = {};

    _openModal = () => {
        let {navigator} = this.props;

        navigator.showModal({
            screen: 'goodsh.AddLineupSheet',
            animationType: 'none',
            passProps: {
                disableOffline: this.props.disableOffline,
                onFinished: (lineup) => {
                    navigator.dismissModal({animationType: 'none'});
                    this.props.onListCreated && this.props.onListCreated(lineup)
                }
            }
        });
    };

    render() {

        let {style, styleText} = this.props;

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
                <GTouchable onPress={this._openModal}>
                    <View style={[styles.header, style]}>
                        <Text
                            style={[
                                styles.headerText,
                                {
                                    flex:0,
                                    color: Colors.black
                                },
                                styleText
                            ]}
                        >{i18n.t('create_list_controller.title')}</Text>
                    </View>
                </GTouchable>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText:{
        flex: 1,
        textAlignVertical: 'center',

        fontSize: 16,
    },
});
