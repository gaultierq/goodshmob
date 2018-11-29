// @flow

import React from 'react'

import {ScrollView, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api"
import {reduceList2} from "../../managers/Api"
import Feed from "../components/feed"
import ApiAction from "../../helpers/ApiAction"
import {buildData} from "../../helpers/DataUtils"
import type {Activity} from "../../types"
import Screen from "../components/Screen"
import AppShareButton from "../components/AppShareButton"
import {LINEUP_PADDING, STYLES} from "../UIStyles"
import {TRANSPARENT_SPACER} from "../UIComponents"
import ActivityStatus from "../activity/components/ActivityStatus"

type Props = {
    navigator: *,
    interaction: *,
    data: *
};

type State = {
};
const logger = rootlogger.createLogger('interactions')

const FETCH_INTERACTIONS = ApiAction.create("fetch_interactions", "retrieve user notifications");

const mapStateToProps = (state, ownProps) => ({
    interaction: state.interaction,
    data: state.data,
});

@logged
@connect(mapStateToProps)
export class InteractionScreen extends Screen<Props, State> {


    render() {
        let {interaction} = this.props
        let list = interaction.list

        logger.log('render')

        return (

            <View style={{flex: 1, width: '100%', height: '100%', backgroundColor: Colors.white}}>

                <Feed
                    initialNumToRender={10}
                    data={list}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={{
                        callFactory: InteractionScreen.fetchInteractions.bind(this),
                        useLinks: true,
                        action: FETCH_INTERACTIONS,
                    }}
                    hasMore={!interaction.hasNoMore}
                    ItemSeparatorComponent={TRANSPARENT_SPACER(12)}
                    contentContainerStyle={{paddingTop: 10}}
                    ListEmptyComponent={
                        <View>
                            <AppShareButton text={i18n.t('actions.invite')}/>
                            <Text style={STYLES.empty_message}>{i18n.t('interactions.empty_screen')}</Text>
                        </View>
                    }
                    visibility={this.getVisibility()}
                />
            </View>

        );
    }

    static fetchInteractions() {
        return new Api.Call().withMethod('GET')
            .withRoute(`interactions`)
            .include("user,resource,resource.resource")
    }

    renderItem({item}) {
        let activity: Activity = buildData(this.props.data, item.type, item.id);
        return (<ActivityStatus
            activity={activity}
            descriptionNumberOfLines={3}
            navigator={this.props.navigator}
            cardStyle={{
                paddingHorizontal: LINEUP_PADDING,
                paddingVertical: 10,}}
        />)
    }
}

export const reducer = (state = Api.initialListState(), action) => {
    return reduceList2(state, action, FETCH_INTERACTIONS)
}
