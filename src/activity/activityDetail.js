// @flow

import React, {Component} from 'react';
import {ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import * as actions from './actions'
import * as actionTypes from './actionTypes'
import {connect} from "react-redux";
import ActivityBody from "./components/ActivityBody";
import {buildNonNullData} from "../utils/DataUtils";
import {MainBackground} from "../screens/UIComponents";
import ActivityDescription from "./components/ActivityDescription";
import type {Activity} from "../types";
import * as UI from "../screens/UIStyles";
import FeedSeparator from "./components/FeedSeparator";
import ActivityActionBar from "./components/ActivityActionBar";
import * as _ from "lodash";
import Icon from 'react-native-vector-icons/Entypo';
import UserRow from "./components/UserRow";

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
                        { activity && <View>
                            <View style={[UI.CARD(), {marginBottom: 40}]}>
                                <ActivityBody
                                    activity={activity}
                                    navigator={this.props.navigator}
                                    onPressItem={this.props.onPressItem}
                                />

                                <FeedSeparator/>

                                <ActivityActionBar
                                    activity={activity}
                                    navigator={this.props.navigator}
                                    actions={['share', 'save', 'buy']}
                                />
                            </View>

                            <FeedSeparator/>

                            <ActivityDescription activity={activity} navigator={this.props.navigator}/>

                            {this.renderStuff(activity)}

                            <FlatList
                                data={relatedActivities}
                                renderItem={this.renderRelatedActivities.bind(this)}
                                keyExtractor={(item, index) => item.id}
                            />
                        </View>
                        }
                    </View>
                </ScrollView>
            </MainBackground>
        );
    }

    renderStuff(activity) {
        return (
            <TouchableHighlight
                onPress={()=> this.displayActivityComments(activity)}>
                <View style={[UI.CARD(0), {padding: 8, paddingLeft: 12, backgroundColor: "#fefefe"}]}>

                    {/*empty*/}
                    {_.isEmpty(activity.commentators) &&
                    <View style={{flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }
                    }>
                        <Text style={[UI.TEXT_LEAST_IMPORTANT, {marginLeft: 18}]}>No one commented yet</Text>
                        <Icon name="chevron-small-right" size={20} color={UI.Colors.grey1} />
                    </View>
                    }

                    {/*non empty*/}
                    {!_.isEmpty(activity.commentators) &&
                    <View style={{flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }
                    }>
                        <UserRow user={activity.commentators[0]} text={"answered"} small={true}/>
                        <Icon name="chevron-small-right" size={20} color={UI.Colors.grey1} />
                    </View>
                    }



                </View>
            </TouchableHighlight>);
    }

    renderRelatedActivities({item}) {
        return (<View>
                <TouchableHighlight
                    onPress={()=> this.displayActivityComments(item)}
                >
                    <View>
                        <ActivityDescription activity={item} navigator={this.props.navigator}/>
                    </View>

                </TouchableHighlight>
                {this.renderStuff(item)}
            </View>
        );
    }

    displayActivityComments(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: "Commentaires", // navigation bar title of the pushed screen (optional)
            passProps: {
                activityId: activity.id,
                activityType: activity.type
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