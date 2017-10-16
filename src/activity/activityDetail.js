// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';
import * as actions from './actions'
import * as actionTypes from './actionTypes'
import {connect} from "react-redux";
import ActivityCell from "./components/ActivityCell";
import {buildNonNullData} from "../utils/DataUtils";
import {MainBackground} from "../screens/UIComponents";
import ActivityDescription from "./components/ActivityDescription";
import type {Activity} from "../types";

class ActivityDetailScreen extends Component {

    constructor(){
        super();
        this.state = {};
    }

    componentDidMount() {
        //this.activity = this.makeActivity();
        this.load();
    }


    load() {
        this.props.dispatch(actions.fetchActivityAndRelated(this.props.activityId, this.props.activityType));
    }


    render() {
        let activity = this.makeActivity();

        let showLoader = !activity && this.isLoading();
        let relatedActivities = activity.relatedActivities;

        return (
            <MainBackground>
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
                        {activity &&
                        <FlatList
                            data={relatedActivities}
                            renderItem={this.renderRelatedActivities.bind(this)}
                            keyExtractor={(item, index) => item.id}
                        />
                        }


                    </View>
                </ScrollView>
            </MainBackground>
        );
    }

    renderRelatedActivities(it) {
        let rel = it.item;
        return (
            <TouchableHighlight
                onPress={()=> this.displayActivityComments(rel)}
            >
                <View>
                    <ActivityDescription activity={rel}/>
                </View>

            </TouchableHighlight>
        );
    }

    displayActivityComments(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: "Commentaires", // navigation bar title of the pushed screen (optional)
            passProps: {
                activity
            },
        });
    }



    isLoading() {
        return !!this.props.request.isLoading[actionTypes.FETCH_ACTIVITY.name()];
    }

    makeActivity() {
        return this.props.activity || buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
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