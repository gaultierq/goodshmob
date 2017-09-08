import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView} from 'react-native';
import  * as appActions from '../actions/appActions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";

class DebugScreen extends Component {

    constructor(){
        super();
        this.state = {text: ":)"};
    }

    render() {
        return (
            <ScrollView>
                <View style={styles.container}>
                    <Button
                        title="logout"
                        onPress={this.logout.bind(this)}
                    />
                    <Button
                        title="print storage"
                        onPress={this.printStorage.bind(this)}
                    />
                    <Text>{this.state.text}</Text>
                </View>
            </ScrollView>
        );
    }

    logout() {
        this.props.dispatch(appActions.logout());
    }

    printStorage() {
        AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiGet(keys, (err, stores) => {
                let text = 'Storage values:\n';
                stores.map((result, i, store) => {
                    // get at each store's key/value so you can work with it
                    let key = store[i][0];
                    let value = store[i][1];
                    text += `key=${key}, value=${value}\n`
                });
                this.setState({text});
            });
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    }
});

export default connect()(DebugScreen);