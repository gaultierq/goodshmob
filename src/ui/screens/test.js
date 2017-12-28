// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import {CheckBox} from "react-native-elements";
import Modal from 'react-native-modal'
import GTouchable from "../GTouchable";

type Props = {
};

type State = {
};


export default class TestScreen extends Component<Props, State> {
    state = {
        isModalVisible: false
    }

    _showModal = () => this.setState({ isModalVisible: true })

    _hideModal = () => this.setState({ isModalVisible: false })
    render() {
        console.log("hello:" + require('../../managers/Messenger'));
        console.log("hello:" + require('../../managers/Messenger'));
        return (

            <View style={{ flex: 1 }}>
                <GTouchable onPress={this._showModal}>
                    <Text>Show Modal</Text>
                </GTouchable>
                <Modal
                    isVisible={this.state.isModalVisible}
                    onBackdropPress={this._hideModal}
                >
                    <View style={{ flex: 1, backgroundColor: 'white'}}>
                        <Text>Hello!</Text>
                    </View>
                </Modal>
            </View>
        );
    }
}

