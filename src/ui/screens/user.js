// @flow
import React from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import type {Id} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {isCurrentUserId, logged} from "../../managers/CurrentUser"
import Feed from "../components/feed";
import {FETCH_ACTIVITIES, fetchUserNetwork} from "../networkActions";
import ActivityCell from "../activity/components/ActivityCell";
import Screen from "../components/Screen";
import {activityFeedProps, MainBackground} from "../UIComponents";
import {STYLES} from "../UIStyles";
import ShareButton from "../components/ShareButton";
import UserLineups from "./userLineups";
import LineupHorizontal from "../components/LineupHorizontal";
import {seeList} from "../Nav";

type Props = {
    userId: Id,
    navigator: any,
    network: *
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
});

@logged
@connect(mapStateToProps)
export default class UserScreen extends Screen<Props, State> {

    render() {

        let userId = this.props.userId;


        return (
            <MainBackground>


                {/*<Feed*/}
                    {/*data={activities}*/}
                    {/*renderItem={this.renderItem.bind(this)}*/}
                    {/*fetchSrc={{*/}
                        {/*callFactory: ()=>fetchUserNetwork(userId),*/}
                        {/*useLinks: true,*/}
                        {/*action: FETCH_ACTIVITIES,*/}
                        {/*options: {userId}*/}
                    {/*}}*/}
                    {/*hasMore={!network.hasNoMore}*/}
                    {/*empty={<View><Text style={STYLES.empty_message}>{i18n.t('common.empty_feed_generic')}</Text><ShareButton text={i18n.t('actions.invite')}/></View>}*/}
                    {/*{...activityFeedProps()}*/}
                {/*/>*/}

                <UserLineups
                    displayName={"user feed"}
                    feedId={"user list"}
                    userId={userId}
                    navigator={this.props.navigator}
                    empty={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    initialLoaderDelay={500}

                    sectionMaker={(lineups)=> {
                        // const goodshbox = _.head(lineups);
                        // let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
                        const navigator = this.props.navigator;
                        return lineups.map(lineup => ({
                            data: [lineup],
                            title:lineup.name,
                            subtitle: ` (${_.get(lineup, `meta.savingsCount`, null) || 0})`,
                            onPress: () => seeList(navigator, lineup.id),
                            renderItem: ({item}) => (
                                <LineupHorizontal
                                    lineupId={item.id}
                                    navigator={navigator}
                                    withAddInEmptyLineup={isCurrentUserId(userId)}
                                />
                            )
                        }));
                        // return [
                        //     {
                        //         data: goodshbox ? [goodshbox] : [],
                        //         title: i18n.t("lineups.goodsh.title"),
                        //         subtitle: ` (${savingCount})`,
                        //         onPress: () => seeList(navigator, goodshbox.id),
                        //         renderItem: ({item}) => (
                        //             <LineupHorizontal lineupId={item.id} navigator={this.props.navigator} />
                        //         )
                        //     },
                        //     {
                        //         data: _.slice(lineups, 1),
                        //         title: i18n.t("lineups.other.title"),
                        //         renderItem: ({item})=>(
                        //             <LineupHorizontal
                        //                 lineupId={item.id}
                        //                 navigator={this.props.navigator}
                        //                 // withMenuButton={true}
                        //                 withLineupTitle={true}
                        //             />
                        //         )
                        //     },
                        // ];
                    }}

                />
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
