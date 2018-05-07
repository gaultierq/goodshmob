// @flow
import React from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import type {Id, RNNNavigator} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {isCurrentUserId, logged} from "../../managers/CurrentUser"
import Feed from "../components/feed";
import {FETCH_ACTIVITIES, fetchUserNetwork} from "../networkActions";
import ActivityCell from "../activity/components/ActivityCell";
import Screen from "../components/Screen";
import {activityFeedProps, LINEUP_SECTIONS, MainBackground} from "../UIComponents";
import {STYLES} from "../UIStyles";
import ShareButton from "../components/ShareButton";
import UserLineups from "./userLineups";
import LineupHorizontal, {LineupH1} from "../components/LineupHorizontal";
import {seeActivityDetails, seeList, startAddItem} from "../Nav";
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
        topBarElevationShadowEnabled: false,
        // those props only affect Android
        navBarTitleTextCentered: true,
        navBarSubTitleTextCentered: true,
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
                <UserLineups
                    displayName={"user feed"}
                    feedId={"user list"}
                    userId={userId}
                    navigator={this.props.navigator}
                    empty={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    initialLoaderDelay={500}
                    sectionMaker={LINEUP_SECTIONS(this.props.navigator, userId)}

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
