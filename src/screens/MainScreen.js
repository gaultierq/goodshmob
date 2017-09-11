import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList, Button, Image} from 'react-native';
import  * as activitesActions from '../actions/activitiesActions'
import {connect} from "react-redux";
import { Card } from 'react-native-elements'


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
                          keyExtractor={this.keyExtractor}
                />
            </View>
        );
    }

    renderItem(item) {
        let activity = item.item;
        console.debug("rendering:"+JSON.stringify(activity));
        let image = activity.resource ? activity.resource.image : undefined;
        console.debug("rendering (image):"+image);
        return <ActivityItem
            id={activity.id}
            onPressItem={this.onPressItem}
            title={activity.description}
            image={image}
        />
    }
}

class ActivityItem extends React.Component {
    _onPress = () => {
        this.props.onPressItem(this.props.id);
    };

    render() {
        return (
            <Card image={{uri: this.props.image}}
                  imageStyle={styles.image}>
                <Text style={styles.name}>{this.props.title}</Text>
            </Card>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    image: {
        width: "100%",
        height: 250
    }
});

const mapStateToProps = (state, ownProps) => ({
    activities: state.activities,
});


export default connect(mapStateToProps)(MainScreen);