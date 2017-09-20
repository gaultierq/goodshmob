import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";

class ActivityScreen extends Component {

    constructor(){
        super();
        this.state = {};
    }


    componentDidMount() {
        this.load();
    }


    load() {
        this.props.dispatch(actions.fetchActivity(this.props.activity.id, this.props.activity.type));
    }


    render() {
        return (
            <ScrollView>
                <View style={styles.container}>
                    <Text>{this.state.text}</Text>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

export default connect()(ActivityScreen);