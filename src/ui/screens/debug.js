// @flow

import React from 'react';
import {AsyncStorage, Clipboard, Button, ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {currentUser, logged} from "../../managers/CurrentUser"
import {CheckBox} from "react-native-elements";
import {CONFIG_SET} from "../../reducers/dataReducer";
import Screen from "../components/Screen";
// import codePush from "react-native-code-push";
import {Messenger} from "../../managers/Messenger"
import Config from 'react-native-config'
import {Colors} from "../colors";
import BugsnagManager from "../../managers/BugsnagManager";

type Props = {
}

type State = {
}

@logged
@connect((state)=>({
    config: state.config,
    device: state.device
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
                        title="show build information"
                        onPress={this.showBuildInfo.bind(this)}
                    />
                    <Button
                        title="show all config"
                        onPress={this.showAllConfig.bind(this)}
                    />
                    <Button title="show device information" onPress={this.showDeviceInfo.bind(this)}/>

                    <Button title="crash app" onPress={() => {throw new Error("debug crash")}}/>

                    <Button title="notify bugsnag" onPress={() => {
                        BugsnagManager.notify(new Error("debug notify"))
                    }}/>

                    <Text>{this.state.text}</Text>
                </View>
            </ScrollView>
        );
    }

    showBuildInfo() {
        let text = _.keys(Config).filter(k=>k.startsWith("GOODSH_BUILD")).map(k=> `${k}=${Config[k]}`).join('\n');

        this.setState({text});
    }

    showAllConfig() {
        let text = _.keys(Config).map(k=> `${k}=${Config[k]}`).join('\n');

        this.setState({text});
    }

    showDeviceInfo() {
        const device = this.props.device;
        let text = _.keys(device).map(k=> `${k}=${device[k]}`).join('\n');
        this.setState({text});
    }

    // syncCodepush() {
    //     codePush.sync({
    //             updateDialog: true,
    //             installMode: codePush.InstallMode.IMMEDIATE
    //         },
    //         (status) => {
    //             this.setState({text: `Codepush:status=${status}`});
    //         }
    //     );
    // }

    copyStorage() {
        this.getStorage().then(storage=> {
            Clipboard.setString(storage);
            Messenger.sendMessage("copié!");
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
