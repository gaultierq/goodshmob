
import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';

export default class MainScreen extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <View style={styles.container}>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    }
});