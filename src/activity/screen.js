import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, ScrollView, ActivityIndicator} from 'react-native';
import  * as actions from './actions'
import {connect} from "react-redux";
import {AsyncStorage} from "react-native";
import ActivityCell from "./components/ActivityCell";

class ActivityScreen extends Component {

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
        let data = this.props.activity.data;
        if (!data && this.props.activities.activities) {
            data = this.props.activities.activities.find((a) => a.id === this.props.activityId);
        }

        return (
            <ScrollView>
                <View style={styles.container}>
                    <ActivityIndicator
                        animating = {this.props.activity.fetching}
                        size = "small"
                    />
                    { data && <ActivityCell activity={data}/>}

                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    activity: state.activity,
    activities: state.activities,
});

export default connect(mapStateToProps)(ActivityScreen);