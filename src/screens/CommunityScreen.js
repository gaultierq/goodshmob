import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView} from 'react-native';
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import * as UI from "./UIStyles";

class CommunityScreen extends Component {

    static navigatorButtons = {
        leftButtons: [
            {
                icon: require('../img/profil.png'),
                id: 'profile'
            }
        ],
        rightButtons: [
            {
                icon: require('../img/next.png'),
                id: 'back'
            }
        ],
    };

    static navigatorStyle = UI.NavStyles;

    constructor(props){
        super();
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.state = {text: ""};
        props.navigator.toggleNavBar({
            to: 'shown', // required, 'hidden' = hide navigation bar, 'shown' = show navigation bar
            animated: true // does the toggle have transition animation or does it happen immediately (optional). By default animated: true
        });

    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            if (event.id === 'profile') {
                this.props.navigator.toggleDrawer({
                    side: 'right',
                    animated: true
                })
            }
            if (event.id === 'back') {
                this.props.navigator.toggleDrawer({
                    side: 'right',
                    animated: true
                })
            }
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <Text>toto</Text>
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

export default connect()(CommunityScreen);