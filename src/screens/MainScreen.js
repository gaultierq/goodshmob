import React, {Component} from 'react';
import {StyleSheet, View, Button, Text} from 'react-native';
import  * as activitesActions from '../actions/activitiesActions'
import {connect} from "react-redux";

class MainScreen extends Component {

    constructor(){
        super();
    }

    componentDidMount() {
        this.props.dispatch(activitesActions.fetchActivities());
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    { `activities: ${JSON.stringify(this.props.activities)}`}
                </Text>
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

const mapStateToProps = (state, ownProps) => ({
    activities: state.activities,
});


export default connect(mapStateToProps)(MainScreen);