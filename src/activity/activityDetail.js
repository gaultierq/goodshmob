// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator} from 'react-native';
import  * as actions from './actions'
import  * as actionTypes from './actionTypes'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import ActivityCell from "./components/ActivityCell";
import build from 'redux-object'

class ActivityDetailScreen extends Component {

    constructor(){
        super();
        this.state = {};
    }


    componentDidMount() {
        this.load();
    }


    load() {
        this.props.dispatch(actions.fetchActivity(this.props.activityId, this.props.activityType));
    }


    render() {
        let activity = this.getActivity();

        let showLoader = !activity && this.isLoading();
        
        return (
            <ScrollView>
                <View style={styles.container}>
                    <ActivityIndicator
                        animating = {showLoader}
                        size = "small"
                    />
                    { activity &&
                    <ActivityCell
                        activityId={activity.id}
                        activityType={activity.type}
                    />}

                </View>
            </ScrollView>
        );
    }

    isLoading() {
        return !!this.props.request.isLoading[actionTypes.FETCH_ACTIVITY.name()];
    }

    getActivity() {
        return build(this.props.data, this.props.activityType, this.props.activityId);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    request: state.request,
});


let screen = connect(mapStateToProps)(ActivityDetailScreen);

export {screen};