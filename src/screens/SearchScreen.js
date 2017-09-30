import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView} from 'react-native';
import  * as appActions from '../auth/actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";

class SearchScreen extends Component {

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

export default connect()(SearchScreen);