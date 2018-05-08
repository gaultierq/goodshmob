// @flow

import React from 'react';
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import Screen from "../components/Screen";
import Feed, {FeedSource} from "../components/feed";
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import type {Id} from "../../types";
import {STYLES} from "../UIStyles";
import {LINEUP_SECTIONS, renderEmptyLineup, renderSectionHeader} from "../UIComponents";
import {reducerFactory} from "../../managers/Api";
import {LineupH1} from "../components/LineupHorizontal";
import {buildData} from "../../helpers/DataUtils";


type Props = {
};

type State = {
};


@logged
@connect(state => ({
    data: state.data,
    followed_lists: state.followed_lists,
}))
export default class MyInterests extends Screen<Props, State> {


    render() {
        let userId = currentUserId()

        let followed_lists = this.props.followed_lists
        let followed = _.slice(followed_lists.list);

        return (
            <Feed
                displayName={"my interests"}
                data={followed}
                renderSectionHeader={({section}) => renderSectionHeader(section)}
                sections={LINEUP_SECTIONS(this.props.navigator, this.props.dispatch, userId)(followed.map(f => buildData(this.props.data, f.type, f.id)))}
                // renderItem={({item, index})=>(
                //     <LineupH1
                //         lineup={item}
                //         navigator={navigator}
                //         skipLineupTitle={true}
                //         renderEmpty={renderEmptyLineup(navigator, item)}
                //     />
                // )}
                empty={<View><Text style={STYLES.empty_message}>{i18n.t('community_screen.empty_screen')}</Text></View>}
                fetchSrc={this.fetchSrc(userId)}
            />
        )
    }

    fetchSrc(userId: Id): FeedSource {
        return {
            callFactory: () => fetchFollowedLineups(userId),
            action: FETCH_FOLLOWED_LINEUPS,
            options: {userId}
        }
    }

}

const FETCH_FOLLOWED_LINEUPS = ApiAction.create("fetch_followed_lineups", "retrieve the user followed lineups details");

const fetchFollowedLineups =  userId => new Api.Call()
    .withMethod('GET')
    .withRoute(`users/${userId}/followed_lists`)
    .addQuery({include: "savings,savings.resource"})


export const reducer = reducerFactory(FETCH_FOLLOWED_LINEUPS)