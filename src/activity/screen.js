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
        let data = this.props.activity.all[this.props.activityId];

        let showLoader = !data && this.props.activity.fetch.requesting;
        
        return (
            <ScrollView>
                <View style={styles.container}>
                    <ActivityIndicator
                        animating = {showLoader}
                        size = "small"
                    />
                    { data && <ActivityCell activityId={data.id}/>}

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