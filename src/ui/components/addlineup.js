// @flow

import React, {Component} from 'react';
import {Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import i18n from '../../i18n/i18n'
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import type {RNNNavigator} from "../../types";


type Props = {
    navigator: RNNNavigator,
};

type State = {
};


@connect()
@logged
export default class AddLineupComponent extends Component<*, *> {

    state = {};

    _openModal = () => {
        let {navigator} = this.props;

        navigator.showModal({
            screen: 'goodsh.AddLineupSheet', // unique ID registered with Navigation.registerScreen
            animationType: 'none'
        });
    };

    render() {

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
                <GTouchable onPress={this._openModal}>
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
                </GTouchable>
            </View>
        );
    }

    // createModal() {
    //     return <Modal
    //         isVisible={!!this.state.isCreatingLineup}
    //         backdropOpacity={0.3}
    //         onBackButtonPress={() => {
    //             this._closeModal();
    //             return true;
    //         }}
    //         onBackdropPress={this._closeModal}
    //     >
    //
    //         <View style={[UI.CARD(12), styles.header, {flexDirection: 'column'}]}>
    //
    //             <Text style={{fontSize: 16, marginBottom: 12}}>{i18n.t('create_list_controller.action')}</Text>
    //             <SmartInput
    //                 execAction={(input: string) => this.createLineup(input)}
    //                 placeholder={"create_list_controller.placeholder"}
    //                 button={<Text>{i18n.t('actions.create')}</Text>}
    //                 returnKeyType={'go'}
    //             />
    //
    //             <CheckBox
    //                 right
    //                 title={i18n.t('create_list_controller.visible')}
    //                 size={16}
    //                 checkedColor={Colors.greyishBrown}
    //                 uncheckedColor={Colors.greyishBrown}
    //                 onPress={(newValue) => this.setState({newLineupPrivacy: !!this.state.newLineupPrivacy ? 0 : 1})}
    //                 checked={!this.state.newLineupPrivacy}
    //                 textStyle={{color: Colors.greyishBrown, fontSize: 12,}}
    //                 containerStyle={{backgroundColor: "transparent", borderWidth: 0, width: "100%"}}
    //             />
    //
    //         </View>
    //
    //     </Modal>;
    // }

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
