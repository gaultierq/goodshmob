import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView} from 'react-native';
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";

class LineUpScreen extends Component {

    constructor(){
        super();
        this.state = {text: ""};
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.container}>

                </View>
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    }
});

export default connect()(LineUpScreen);