import React, {Component} from 'react';
import {StyleSheet, View, Button, Text, FlatList} from 'react-native';
import  * as activitesActions from '../actions/activitiesActions'
import {connect} from "react-redux";

class MainScreen extends Component {


    _keyExtractor = (item, index) => item.id;


    constructor(){
        super();
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        this.props.dispatch(activitesActions.fetchActivities());
    }

    renderItem(item) {
        let activity = item.item;
        return <ActivityItem
            id={activity.id}
            onPressItem={this.onPressItem}
            title={`bing ${activity.id}`}
        />
    }

    onPressItem(id) {
        alert(`coucou ${id}`);
    }

    render() {
        let activities = this.props.activities.activities || [{id: 35}];
        return (
            <View style={styles.container}>
                <Button
                    title="fetch"
                    onPress={this.fetch.bind(this)}
                />

                <FlatList style={styles.list}
                    data={activities}
                    renderItem={this.renderItem}
                    keyExtractor={this._keyExtractor}
                />
                {/*<Text>*/}
                    {/*{ `activities ${activities.length}: ${JSON.stringify(activities)}`}*/}
                {/*</Text>*/}
            </View>
        );
    }
}

class ActivityItem extends React.Component {
    _onPress = () => {
        this.props.onPressItem(this.props.id);
    };

    render() {
        return (
            <Text
                onPress={this._onPress}
            >
                {`heeeey: ${this.props.title}`}
            </Text>
        )
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