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
import {seeActivityDetails, seeList} from "../Nav";
import * as UI from "../UIStyles";
import {fullName} from "../../helpers/StringUtils";

type Props = {
    userId: Id,
    user:? User,
    navigator: any,
    network: *
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@logged
@connect(mapStateToProps)
export default class UserScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    };

    constructor(props: Props) {
        super(props);
    }


    render() {

        let userId = this.props.userId;
        //FIXME: rm platform specific code, https://github.com/wix/react-native-navigation/issues/1871
        if (this.isVisible() && this.props.user) {
            if (__IS_IOS__) {
                this.props.navigator.setStyle({...UI.NavStyles,
                    navBarCustomView: 'goodsh.UserNav',
                    navBarCustomViewInitialProps: {
                        user: this.props.user,
                    }
                });
            }
            else {
                this.setNavigatorTitle(this.props.navigator, {title: fullName(this.props.user)})
            }
        }

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
                                    onSavingPressed={seeActivityDetails}
                                    onLineupPressed={seeList}
                                />
                            )
                        }));
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
