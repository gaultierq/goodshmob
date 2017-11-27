// @flow

import React, {Component} from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import {connect} from "react-redux";
import Snackbar from "react-native-snackbar"
import i18n from '../../i18n/i18n'
import * as UI from "../UIStyles";
import {createLineup} from "../actions";
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import type {Visibility} from "../additem";
import Modal from 'react-native-modal'
import SmartInput from "./SmartInput";


type Props = {
};

type State = {
    isCreatingLineup?: boolean, //create lineup mode
    newLineupPrivacy?: Visibility,
};

@connect()
export default class AddLineupComponent extends Component<Props, State> {

    state = {
    };

    _closeModal = ()=> {this.setState({isCreatingLineup: false})};

    _openModal = () => {this.setState({isCreatingLineup: true})};


    render() {

        let grey1 = UI.Colors.grey1;

        let visiblee = !!this.state.isCreatingLineup;

        // return (
        //     <View style={{ flex: 1 }}>
        //         <TouchableWithoutFeedback onPress={this._openModal}>
        //             <View style={
        //                 [UI.CARD(), styles.header]
        //             }>
        //                 <Image source={require('../../img/plus.png')}
        //                        resizeMode="contain"
        //                        style={{
        //                            width: 20,
        //                            height: 20,
        //                            marginRight: 10
        //                        }}
        //                 />
        //                 <Text
        //                     style={[
        //                         styles.headerText,
        //                         {color: UI.Colors.grey2},
        //                         Platform.OS === 'ios'? {lineHeight: 40} : {height: 40}
        //                     ]}
        //                 >{i18n.t('create_list_controller.title')}</Text>
        //             </View>
        //         </TouchableWithoutFeedback>
        //         <Modal
        //             isVisible={visiblee}
        //             backdropOpacity={0.3}
        //             onBackdropPress={this._closeModal}
        //         >
        //             <View style={{ flex: 1 }}>
        //                 <Text>Hello!</Text>
        //             </View>
        //         </Modal>
        //     </View>
        // );

        return (
            <View style={{flex: 1}}>
                <TouchableWithoutFeedback onPress={this._openModal}>
                    <View style={
                        [UI.CARD(), styles.header]
                    }>
                        <Image source={require('../../img/plus.png')}
                               resizeMode="contain"
                               style={{
                                   width: 20,
                                   height: 20,
                                   marginRight: 10
                               }}
                        />
                        <Text
                            style={[
                                styles.headerText,
                                {color: UI.Colors.grey2},
                                Platform.OS === 'ios'? {lineHeight: 40} : {height: 40}
                            ]}
                        >{i18n.t('create_list_controller.title')}</Text>
                    </View>
                </TouchableWithoutFeedback>

                <Modal
                    isVisible={visiblee}
                    backdropOpacity={0.3}
                    onBackdropPress={this._closeModal}
                >

                    <View style={[UI.CARD(6), styles.header, {flexDirection: 'column'}]}>

                        <Text style={{fontSize: 16, marginBottom: 12}}>Créer une nouvelle liste:</Text>
                        <SmartInput
                            execAction={(input: string) => this.createLineup(input)}
                            placeholder={"create_list_controller.placeholder"}
                            button={<Text>Créer</Text>}
                        />

                        <CheckBox
                            right
                            title='Visible par mes amis'
                            size={16}
                            checkedColor={grey1}
                            uncheckedColor={grey1}
                            onPress={(newValue)=> this.setState({newLineupPrivacy: !!this.state.newLineupPrivacy ? 0 : 1})}
                            checked={!this.state.newLineupPrivacy}
                            textStyle={{color: grey1, fontSize: 12, }}
                            containerStyle={{ backgroundColor: "transparent", borderWidth: 0, width: "100%"}}
                        />

                    </View>

                </Modal>
            </View>
        );
    }

    createLineup(name: string) {
        return this.props.dispatch(createLineup(name))
            .then(this._closeModal)
            .then(()=> Snackbar.show({title: "Liste créée"}));
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    selectAList: {
        padding: 10,
        fontFamily: 'Chivo-Light',
        color: 'black',
        fontSize: 20,
        alignSelf: "center",
        backgroundColor:"transparent"
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: 'white',
    },
    header: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    input:{
        height: 40,
        width: "100%",
        fontFamily: 'Chivo',
        fontSize: 18,
        borderWidth: 0.5,
        borderColor: UI.Colors.grey1
    },
    colorActive:{
        color: 'green',
    },
    colorInactive:{
        color: 'black',
    },
    headerText:{
        flex: 1,
        textAlignVertical: 'center',
        fontFamily: 'Chivo',
        fontSize: 18,
    },
    inputContainer:{
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 14,
        margin: 10,
        backgroundColor: 'white'
    },
});
