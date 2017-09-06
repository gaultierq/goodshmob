
import React, {Component} from 'react';
import {StyleSheet, View, Button} from 'react-native';
import LoginManager from '../managers/LoginManager'

//throw new Error();

export default class MainScreen extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <View style={styles.container}>
                <Button
                    title="logout"
                    onPress={this.logout.bind(this)}
                />
            </View>
        );
    }

    logout() {
        LoginManager.logout(() => {
            this.props.navigator.push({
                screen: 'goodsh.LoginScreen',
                title: 'Goodsh'
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