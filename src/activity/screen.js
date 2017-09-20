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
        if (this.state.isRequesting) return;
        this.setState({isRequesting: true});

        this.props.dispatch(actions.fetchActivity(
            ()=> {
                this.setState({loadingFirst: false, loadedOnce: true});
            }));
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