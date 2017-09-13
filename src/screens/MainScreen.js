// @flow

import React, {Component} from 'react';
import {View, FlatList, ImageBackground, RefreshControl} from 'react-native';
import  * as activitesActions from '../actions/activitiesActions'
import {connect} from "react-redux";
import * as Model from "../model"
import ActivityItem from "./ActivityCell";

class MainScreen extends Component {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
        this.state = {refreshing: false};
    }

    componentDidMount() {
        this.loadFirst();
    }

    loadMore() {
        if (!this.props.activities.links) return;
        let nextUrl = this.props.activities.links.next;
        console.log("Next url:" + nextUrl);
        this.props.dispatch(activitesActions.fetchMoreActivities(nextUrl));
    }

    loadFirst(callback?) {
        this.props.dispatch(activitesActions.fetchActivities(callback));
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
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        onEndReached={ this.onEndReached.bind(this) }
                        onEndReachedThreshold={0}
                    />
                </View>
            </ImageBackground>
        );
    }

    onEndReached() {
        if (this.props.activities.hasMore) {
            this.loadMore();
        }
        else {
            console.info("end of feed")
        }

    }

    renderItem(item) {
        return <ActivityItem
            onPressItem={this.onPressItem}
            activity={item.item}
        />
    }

    onRefresh() {
        this.setState({refreshing: true});
        this.loadFirst(()=> {
            this.setState({refreshing: false});
        });
    }
}


const mapStateToProps = (state, ownProps) => ({
    activities: state.activities,
});


export default connect(mapStateToProps)(MainScreen);