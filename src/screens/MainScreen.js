// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList, Button, Image, ImageBackground} from 'react-native';
import  * as activitesActions from '../actions/activitiesActions'
import {connect} from "react-redux";
import * as Model from "../model"
import ActivityItem from "./ActivityItem";

class MainScreen extends Component {


    keyExtractor = (item, index) => item.id;


    constructor(){
        super();
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        this.props.dispatch(activitesActions.fetchActivities());
    }

    onPressItem(id) {
    }

    render() {
        let activities = this.props.activities.activities || [];
        return (
            <ImageBackground
                source={require('../img/home_background.png')}
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                }}
            >
                <View style={{
                    flex: 1
                }}>
                    <FlatList
                        data={activities}
                        renderItem={this.renderItem}
                        keyExtractor={this.keyExtractor}
                    />
                </View>
            </ImageBackground>
        );
    }

    renderItem(item) {
        return <ActivityItem
            onPressItem={this.onPressItem}
            activity={item.item}
        />
    }
}


const mapStateToProps = (state, ownProps) => ({
    activities: state.activities,
});


export default connect(mapStateToProps)(MainScreen);