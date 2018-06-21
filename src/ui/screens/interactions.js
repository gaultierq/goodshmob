// @flow

import React from 'react';

import {ScrollView, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import Feed from "../components/feed";
import ApiAction from "../../helpers/ApiAction";
import UserActivity from "../activity/components/UserActivity";
import {buildNonNullData, sanitizeActivityType} from "../../helpers/DataUtils";
import type {Activity} from "../../types";
import Screen from "../components/Screen";
import NavManager from "../../managers/NavManager";
import GTouchable from "../GTouchable";
import ShareButton from "../components/ShareButton";
import {STYLES} from "../UIStyles";
import {TRANSPARENT_SPACER} from "../UIComponents";

type Props = {
    navigator: *,
    interaction: *,
    data: *
};

type State = {
};


const FETCH_INTERACTIONS = ApiAction.create("fetch_interactions", "retrieve user notifications");

const mapStateToProps = (state, ownProps) => ({
    interaction: state.interaction,
    data: state.data,
});

@logged
@connect(mapStateToProps)
export class InteractionScreen extends Screen<Props, State> {


    state = {};

    render() {
        let {interaction} = this.props
        let list = interaction.list

        return (
            <View style={styles.container}>

                <Feed
                    initialNumToRender={10}
                    data={list}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={{
                        callFactory: this.fetchInteractions.bind(this),
                        useLinks: true,
                        action: FETCH_INTERACTIONS,
                    }}
                    hasMore={!interaction.hasNoMore}
                    ItemSeparatorComponent={TRANSPARENT_SPACER(12)}
                    contentContainerStyle={{paddingTop: 10}}
                    ListEmptyComponent={
                        <View>
                            <ShareButton text={i18n.t('actions.invite')}/>
                            <Text style={STYLES.empty_message}>{i18n.t('interactions.empty_screen')}</Text>
                        </View>
                    }
                    visibility={this.getVisibility()}
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

        if (!content) return null;

        return (
            <GTouchable
                onPress={() => {
                    NavManager.goToDeeplink(NavManager.localDeeplink(activity));
                }}>
                <UserActivity
                    activityTime={createdAt}
                    user={user}
                    navigator={this.props.navigator}
                    style={{paddingLeft: 12, paddingRight: 12}}
                >
                </UserActivity>
                <View style={{marginLeft: 51, marginTop: -4}}>
                    {content}
                </View>
            </GTouchable>
        )
    }


    /*
    activity: {
        type:
        user: {
            firstName:
            lastName:
        }
        resource: {
            type:
            content: (if Ask)

            resource: {
                title:
            }
        }
    }
    */
    renderContentByType(activity:Activity) {
        if (!activity) return null;
        let type = activity.type.toLowerCase();
        const resource = activity.resource;

        const user = activity.user;

        const isAsk = sanitizeActivityType(resource.type) === 'asks';

        let build = (key) => {


            let username = user.firstName + " " + user.lastName;

            if (!resource) {
                console.warn(`say QG no resource found on activityId=${activity.id} type=${activity.type}`);
            }
            else {

                if (isAsk) {
                    // return <Text style={{fontSize: 12}}>{username + " ask"}</Text>
                    return <Text style={{fontSize: 14}}>
                        {i18n.t(key, {username, what: resource.content})}
                    </Text>
                }
                else {
                    let innerResource = resource.resource;
                    if (!innerResource) {
                        console.warn("No resource for " , activity);
                        return null;
                    }
                    let item_title = _.toUpper(innerResource.title);

                    return <Text style={{fontSize: 14}}>
                        {i18n.t(key, {username, what: item_title})}
                    </Text>
                }
            }

        };

        switch(type) {
            case 'answer':
                return build("interactions.answer");
            case 'comment':
                if (isAsk) return build("interactions.comment_ask");
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
