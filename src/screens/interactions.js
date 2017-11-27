// @flow

import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View,TouchableOpacity} from 'react-native';
import {connect} from "react-redux";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import ApiAction from "../utils/ApiAction";
import UserActivity from "../activity/components/UserActivity";
import {buildNonNullData} from "../utils/DataUtils";
import type {Activity} from "../types";
import i18n from '../i18n/i18n'
import FeedSeparator from "../activity/components/FeedSeparator";


type Props = {
    navigator: *,
    interaction: *,
    data: *
};

type State = {
};


const FETCH_INTERACTIONS = new ApiAction("fetch_interactions");

const mapStateToProps = (state, ownProps) => ({
    interaction: state.interaction,
    data: state.data,
});

@connect(mapStateToProps)
export class InteractionScreen extends Component<Props, State> {


    //titleSet because when navigating back, a render may change the nav bar title. this is a flaw in wix nav
    state = {};

    render() {
        let interaction = this.props.interaction;
        let data = interaction.list;

        return (
            <View style={styles.container}>
                <Feed
                    data={data}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={{
                        callFactory: this.fetchInteractions.bind(this),
                        useLinks: true,
                        action: FETCH_INTERACTIONS,
                    }}
                    hasMore={!interaction.hasNoMore}
                    ItemSeparatorComponent={()=> <FeedSeparator vMargin={12} />}
                    contentContainerStyle={{paddingTop: 10}}
                />

            </View>
        );
    }
    //"interactions?include=user,resource,resource.resource&page=#{page}"
    fetchInteractions() {
        return new Api.Call().withMethod('GET')
            .withRoute(`interactions`)
            .include("user,resource,resource.resource")
    }

    renderItem({item}) {
        let activity: Activity = buildNonNullData(this.props.data, item.type, item.id);

        let user = activity.user;
        let createdAt = activity.createdAt;
        let content = this.renderContentByType(activity);

        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.navigator.showModal({
                        screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
                        title: "Details", // navigation bar title of the pushed screen (optional)
                        titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
                        passProps: {activityId: activity.id, activityType: activity.type}, // Object that will be passed as props to the pushed screen (optional)
                    });
                }}>
                <UserActivity
                    activityTime={createdAt}
                    user={user}
                    navigator={this.props.navigator}
                    style={{paddingLeft: 12, paddingRight: 12}}
                >
                    {content}
                </UserActivity>
            </TouchableOpacity>
        )
    }

    renderContentByType(activity:Activity) {
        if (!activity) return null;
        let type = activity.type.toLowerCase();

        let build = (key) => {
            let resource = activity.resource;
            let username = activity.user.firstName + " " + activity.user.lastName;

            if (resource.type === 'asks') {
                // return <Text style={{fontSize: 12}}>{username + " ask"}</Text>
                return <Text style={{fontSize: 12}}>
                    {i18n.t(key, {username, what: "ask"})}
                </Text>
            }
            else {
                let innerResource = resource.resource;
                if (!innerResource) throw "No resource for " + JSON.stringify(activity);
                let item_title = innerResource.title.toUpperCase();

                return <Text style={{fontSize: 12}}>
                    {i18n.t(key, {username, what: item_title})}
                </Text>
            }

        };

        switch(type) {
            case 'answer':
                return build("interactions.answer");
            case 'comment':
                return build("interactions.comment");
            case 'like':
                return build("interactions.like");
            default:
                console.error("unhandled type:" + type);
        }
        return null;
    }

}

export const reducer = (state = Immutable(Api.initialListState()), action) => {
    return Api.reduceList(state, action, {fetchFirst: FETCH_INTERACTIONS});
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    description: {
        backgroundColor: 'transparent',
        margin: 10
    },
});
