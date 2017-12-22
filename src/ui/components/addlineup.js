// @flow

import React, {Component} from 'react';
import {Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import {connect} from "react-redux";
import Snackbar from "react-native-snackbar"
import i18n from '../../i18n/i18n'
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import type {Visibility} from "../screens/additem";
import Modal from 'react-native-modal'
import SmartInput from "./SmartInput";
import {LINEUP_CREATION} from '../lineup/actions'
import {Colors} from "../colors";
import * as UI from "../UIStyles";

type Props = {
};

type State = {
    isCreatingLineup?: boolean, //create lineup mode
    newLineupPrivacy?: Visibility,
};

@connect()
export default class AddLineupComponent extends Component<Props, State> {

    state = {};

    _closeModal = ()=> {this.setState({isCreatingLineup: false})};

    _openModal = () => {this.setState({isCreatingLineup: true})};


    render() {

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
                <TouchableOpacity onPress={this._openModal}>
                    <View style={
                        [styles.header]
                    }>
                        <Text
                            style={[
                                styles.headerText,

                                {
                                    flex:0,
                                    color: Colors.black
                                },
                                //__IS_IOS__ ? {lineHeight: 40} : {height: 40}
                            ]}
                        >{i18n.t('create_list_controller.title')}</Text>
                    </View>
                </TouchableOpacity>

                {this.createModal()}
            </View>
        );
    }

    createModal() {
        return <Modal
            isVisible={!!this.state.isCreatingLineup}
            backdropOpacity={0.3}
            onBackButtonPress={() => {
                this._closeModal();
                return true;
            }}
            onBackdropPress={this._closeModal}
        >

            <View style={[UI.CARD(12), styles.header, {flexDirection: 'column'}]}>

                <Text style={{fontSize: 16, marginBottom: 12}}>#Créer une nouvelle liste:</Text>
                <SmartInput
                    execAction={(input: string) => this.createLineup(input)}
                    placeholder={"create_list_controller.placeholder"}
                    button={<Text>#Créer</Text>}
                    returnKeyType={'go'}
                />

                <CheckBox
                    right
                    title="#Visible par mes amis"
                    size={16}
                    checkedColor={Colors.greyishBrown}
                    uncheckedColor={Colors.greyishBrown}
                    onPress={(newValue) => this.setState({newLineupPrivacy: !!this.state.newLineupPrivacy ? 0 : 1})}
                    checked={!this.state.newLineupPrivacy}
                    textStyle={{color: Colors.greyishBrown, fontSize: 12,}}
                    containerStyle={{backgroundColor: "transparent", borderWidth: 0, width: "100%"}}
                />

            </View>

        </Modal>;
    }

    createLineup(name: string) {
        let delayMs = 3000;
        return this.props.dispatch(LINEUP_CREATION.pending({listName: name}, {delayMs}))
            .then((pendingId)=> {
                this._closeModal();
                Snackbar.show({
                        title: "#Liste créée",
                        duration: Snackbar.LENGTH_LONG,
                        action: {
                            title: '#UNDO',
                            color: 'green',
                            onPress: () => {
                                this.props.dispatch(LINEUP_CREATION.undo(pendingId))
                            },
                        },
                    }
                );
            });
    }
}


const styles = StyleSheet.create({
    container: {
        // flex: 1,
    },
    header: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        // padding: 10,
        // marginTop: 10,
        // marginBottom: 10,
    },
    headerText:{
        flex: 1,
        textAlignVertical: 'center',

        fontSize: 16,
    },
});
