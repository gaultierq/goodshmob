// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import {CheckBox} from "react-native-elements";
import Modal from 'react-native-modal'

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
        console.log("hello:" + require('../Messenger'));
        console.log("hello:" + require('../Messenger'));
        return (

            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={this._showModal}>
                    <Text>Show Modal</Text>
                </TouchableOpacity>
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

