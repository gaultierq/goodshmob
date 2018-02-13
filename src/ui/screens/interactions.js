// @flow

import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, Share} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import Feed from "../components/feed";
import ApiAction from "../../helpers/ApiAction";
import UserActivity from "../activity/components/UserActivity";
import {buildNonNullData, sanitizeActivityType} from "../../helpers/DataUtils";
import type {Activity, Deeplink} from "../../types";

import FeedSeparator from "../activity/components/FeedSeparator";
import Screen from "../components/Screen";
import NavManager from "../../managers/NavManager";
import GTouchable from "../GTouchable";
import ShareButton from "../components/ShareButton";

import {Colors} from "../colors";
import Button from 'apsl-react-native-button'
import {SFP_TEXT_MEDIUM} from "../fonts";
import {STYLES} from "../UIStyles";

type Props = {
    navigator: *,
    interaction: *,
    data: *
};

type State = {
};


const FETCH_INTERACTIONS = ApiAction.create("fetch_interactions");

const mapStateToProps = (state, ownProps) => ({
    interaction: state.interaction,
    data: state.data,
});

@logged
@connect(mapStateToProps)
export class InteractionScreen extends Screen<Props, State> {


    state = {};

    render() {
        let interaction = this.props.interaction;
        let data = interaction.list;

        console.log('interaction', interaction);
        console.log('data', data);

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
                    empty={
                        <View>
                            <ShareButton text={i18n.t('actions.invite')}/>
                            <Text style={STYLES.empty_message}>{i18n.t('interactions.empty_screen')}</Text>
                        </View>}
                    // cannotFetch={!super.isVisible()}
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
                    NavManager.goToDeeplink(this.localDeeplink(activity));
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

    //temporary: should be provided by the backend
    localDeeplink(activity: Activity): Deeplink {
        let deeplink;
        const activityType = sanitizeActivityType(activity.type);
        if (!activityType) return null;
        let resource = activity.resource;

        switch (activityType) {
            case 'comments': {

                if (resource) {
                    let {id, type} = resource;
                    return `https://goodsh.it/${sanitizeActivityType(type)}/${id}/comments`
                }
                break;
            }
            default:
                if (resource) {
                    let {id, type} = resource;
                    return `https://goodsh.it/${sanitizeActivityType(type)}/${id}`
                }
        }
    }

    renderContentByType(activity:Activity) {
        if (!activity) return null;
        let type = activity.type.toLowerCase();
        const resource = activity.resource;
        const isAsk = sanitizeActivityType(resource.type) === 'asks';

        let build = (key) => {

            let username = activity.user.firstName + " " + activity.user.lastName;

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
                        console.warn("No resource for " + JSON.stringify(activity));
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
