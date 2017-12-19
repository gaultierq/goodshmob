// @flow

import React from 'react';
import {AsyncStorage, Button, ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {CheckBox} from "react-native-elements";
import {CONFIG_SET} from "../reducers/dataReducer";
import Screen from "./components/Screen";

type Props = {

}

type State = {

}

@connect((state)=>({
    config: state.config
}))
export default class DebugScreen extends Screen<Props, State> {


    _setConfig = (option, value) => this.props.dispatch({
        type: CONFIG_SET,
        option,
        value
    });

    renderConfig = (config) => _.keys(config).map(k=> {
        let value = config[k];
        if (typeof value === 'boolean') {

            return <CheckBox
                title={k}
                onPress={(newValue)=> this._setConfig(k, !value)}
                checked={value}
            />
        }
    });


    render() {

        return (
            <ScrollView style={styles.container}>
                <View style={styles.container}>

                    {
                        this.renderConfig(this.props.config)
                    }
                    <Button
                        title="print storage"
                        onPress={this.printStorage.bind(this)}
                    />
                    <Text>{this.state.text}</Text>
                </View>
            </ScrollView>
        );
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
        backgroundColor: 'transparent',
    }
});
