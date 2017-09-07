import React, {Component} from 'react';
import {StyleSheet, View, Button, Text} from 'react-native';
import  * as appActions from '../actions/app'
import {connect} from "react-redux";

class MainScreen extends Component {

    constructor(){
        super();
        this.state = { searching: false }
    }

    /*
    //TODO: you are here
    componentDidMount() {
        this.props
            .fetchActivities()
            .then((res) => {
            this.setState({searching: false })
        });
    }
    */

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    test
                </Text>
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


export default connect()(MainScreen);