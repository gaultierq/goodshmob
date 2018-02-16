// @flow

import React from 'react';
import {AsyncStorage, Clipboard, Button, ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {currentUser, logged} from "../../managers/CurrentUser"
import {CheckBox} from "react-native-elements";
import {CONFIG_SET} from "../../reducers/dataReducer";
import Screen from "../components/Screen";
import codePush from "react-native-code-push";
import Snackbar from "react-native-snackbar"
import Config from 'react-native-config'
import {Colors} from "../colors";

type Props = {

}

type State = {

}

@logged
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
                    <Button
                        title="send storage"
                        onPress={this.copyStorage.bind(this)}
                    />
                    <Button
                        title="sync codepush"
                        onPress={this.syncCodepush.bind(this)}
                    />
                    <Button
                        title="show build information"
                        onPress={this.showBuildInfo.bind(this)}
                    />
                    <Text>{this.state.text}</Text>
                </View>
            </ScrollView>
        );
    }

    showBuildInfo() {
        let text = _.keys(Config).filter(k=>k.startsWith("BUILD")).map(k=> `${k}=${Config[k]}`).join('\n');

        this.setState({text});
    }

    syncCodepush() {
        codePush.sync({
                updateDialog: true,
                installMode: codePush.InstallMode.IMMEDIATE
            },
            (status) => {
                this.setState({text: `Codepush:status=${status}`});
            }
        );
    }

    copyStorage() {
        this.getStorage().then(storage=> {
            Clipboard.setString(storage);
            Snackbar.show({
                //MagicString
                title: "copié!",
            });
        })
    }

    printStorage() {
        this.getStorage().then(storage=>this.setState({text:storage}))
    }


    getStorage() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getAllKeys((err, keys) => {
                AsyncStorage.multiGet(keys, (err, stores) => {
                    let text = 'Storage values:\n';
                    stores.map((result, i, store) => {
                        // get at each store's key/value so you can work with it
                        let key = store[i][0];
                        let value = store[i][1];
                        text += `key=${key}, value=${value}\n`
                        resolve(text);
                    });
                });
            });
        });
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    }
});
