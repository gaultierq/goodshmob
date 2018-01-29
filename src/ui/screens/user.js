// @flow
import React from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import type {Id} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import Feed from "../components/feed";
import {FETCH_ACTIVITIES, fetchUserNetwork} from "../networkActions";
import ActivityCell from "../activity/components/ActivityCell";
import Screen from "../components/Screen";
import {activityFeedProps, MainBackground} from "../UIComponents";
import {STYLES} from "../UIStyles";

type Props = {
    userId: Id,
    navigator: any,
    network: *
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    network: state.network,
});

@logged
@connect(mapStateToProps)
export default class UserScreen extends Screen<Props, State> {

    render() {

        let userId = this.props.userId;
        let network = this.props.network[userId] || {};
        let activities = network.list;


        return (
            <MainBackground>
                <View>
                    <Feed
                        data={activities}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory: ()=>fetchUserNetwork(userId),
                            useLinks: true,
                            action: FETCH_ACTIVITIES,
                            options: {userId}
                        }}
                        hasMore={!network.hasNoMore}
                        empty={<Text style={STYLES.empty_message}>{i18n.t('common.empty_feed_generic')}</Text>}
                        {...activityFeedProps()}
                    />
                </View>
            </MainBackground>
        );
    }


    renderItem({item}) {

        return (
            <ActivityCell
                onPressItem={() => this.navToActivity(item)}
                activityId={item.id}
                activityType={item.type}
                navigator={this.props.navigator}
            />
        )
    }
}
