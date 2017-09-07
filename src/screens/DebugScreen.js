import React, {Component} from 'react';
import {StyleSheet, View, Button} from 'react-native';
import  * as appActions from '../actions/app'
import {connect} from "react-redux";

class DebugScreen extends Component {

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
        this.props.dispatch(appActions.logout());
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    }
});

export default connect()(DebugScreen);