// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
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
        return (

            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={this._showModal}>
                    <Text>Show Modal</Text>
                </TouchableOpacity>
                <Modal isVisible={this.state.isModalVisible}>
                    <View style={{ flex: 1 }}>
                        <Text>Hello!</Text>
                    </View>
                </Modal>
            </View>
        );
    }
}

