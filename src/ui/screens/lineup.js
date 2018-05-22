// @flow

import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import {activityFeedProps} from "../UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import Feed from "../components/feed";
import type {Lineup, List, Saving} from "../../types";
import {buildData, doDataMergeInState} from "../../helpers/DataUtils";
import ActivityCell from "../activity/components/ActivityCell";
import ActionButton from 'react-native-action-button';
import {startAddItem} from "../Nav";
import {Colors} from "../colors";
import Screen from "./../components/Screen";
import {LINEUP_PADDING, renderSimpleButton, STYLES, TEXT_LESS_IMPORTANT} from "../UIStyles";
import {fullName} from "../../helpers/StringUtils";
import {FETCH_LINEUP, FETCH_SAVINGS} from "../lineup/actions";
import {UNSAVE} from "../activity/actionTypes";
import * as UI from "../UIStyles";
import GTouchable from "../GTouchable";
import * as authActions from "../../auth/actions";
import FollowButton from "../activity/components/FollowButton";
import * as TimeUtils from "../../helpers/TimeUtils";

type Props = {
    lineupId: string,
    navigator: any
};

type State = {
    title: null|{title: string, titleImage: string},
    titleSet: boolean
};

@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
class LineupScreen extends Screen<Props, State> {

    static navigatorStyle = {
        // those props only affect Android
        navBarTitleTextCentered: true,
        navBarSubTitleTextCentered: true,
    };


    render() {
        const lineup = this.getLineup();

        // this.setNavigatorTitle(this.props.navigator, {title: _.get(lineup, 'name'), subtitle: subtitle()});
        //FIXME: rm platform specific code, https://github.com/wix/react-native-navigation/issues/1871
        if (this.isVisible() && lineup) {
            if (__IS_IOS__) {
                this.props.navigator.setStyle({
                    ...UI.NavStyles,
                    navBarCustomView: 'goodsh.LineupNav',
                    navBarCustomViewInitialProps: {
                        user: lineup.user,
                        lineupName: _.get(lineup, 'name'),
                        lineupCount: _.get(lineup, `meta.savingsCount`, null)
                    }
                });
            }
            else {
                let subtitle = () => {
                    const user = _.get(lineup, 'user');
                    //FIXME: MagicString
                    return user && "par " + fullName(user)
                };
                this.setNavigatorTitle(this.props.navigator, {title: _.get(lineup, 'name'), subtitle: subtitle()});
            }
        }


        let savings, fetchSrc;
        if (lineup && lineup.savings) {
            savings = lineup.savings;
            fetchSrc = {
                callFactory:()=>actions.fetchSavings(this.props.lineupId),
                action:FETCH_SAVINGS,
                options: {listId: this.props.lineupId}
            };
        }
        else {
            savings = [];
            fetchSrc = {
                callFactory:()=>actions.fetchLineup(this.props.lineupId),
                action: FETCH_LINEUP,
                options: {listId: this.props.lineupId}
            };
        }

        return (
            <View style={styles.container}>
                {lineup && lineup.description && <Text style={[styles.description]}>{lineup.description}</Text>}
                {this.renderHeader(lineup)}
                <Feed
                    data={savings}
                    renderItem={item => this.renderItem(item, lineup)}
                    fetchSrc={fetchSrc}
                    ListHeaderComponent={this.renderHeader(lineup)}
                    hasMore={true}
                    empty={<Text style={STYLES.empty_message}>{i18n.t("empty.lineup")}</Text>}
                    {...activityFeedProps()}
                />
                {
                    this.displayFloatingButton() &&
                    <ActionButton
                        buttonColor={Colors.green}
                        onPress={() => { this.onFloatingButtonPressed() }}
                    />
                }

            </View>
        );
    }

    //TODO: need a design for this
    renderHeader(lineup: Lineup) {
        if (!lineup) return null
        return (
            <View style={{alignItems: 'flex-end', justifyContent: 'flex-end', paddingHorizontal: LINEUP_PADDING, paddingTop: 6}}>
                <Text style={TEXT_LESS_IMPORTANT}>{`${TimeUtils.timeSince(Date.parse(lineup.createdAt))}`}</Text>
                <View><FollowButton lineup={lineup} /></View>
            </View>
        )
    }

    follow() {
        Api.safeExecBlock.call(
            this,
            () => {
                return authActions.logout(this.props.dispatch)
            },
            'reqLogout'
        );
    }


    displayFloatingButton() {
        let lineup = this.getLineup();

        return lineup && lineup.user && lineup.user.id === currentUserId();
    }

    onFloatingButtonPressed() {
        startAddItem(this.props.navigator, this.props.lineupId);
    }


    getLineup() : List {
        return buildData(this.props.data, "lists", this.props.lineupId);
    }

    renderItem(item, lineup) {
        let saving: Saving = item.item;

        if (!saving['built']) return null;

        return (
            <ActivityCell
                activityId={saving.id}
                activityType={saving.type}
                // skipLineup={true}
                // skipDescription={true}
                onPressItem={() => this.navToSavingDetail(saving)}
                navigator={this.props.navigator}
            />
        )
    }

    deleteSaving(saving) {
        this.props.dispatch(actions.deleteSaving(saving));
    }

    navToSavingDetail(saving) {
        let activity = saving;


        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            passProps: {activityId: activity.id, activityType: activity.type}, // Object that will be passed as props to the pushed screen (optional)
            animated: true, // does the push have transition animation or does it happen immediately (optional)
            animationType: 'slide-up', // 'fade' (for both) / 'slide-horizontal' (for android) does the push have different transition animation (optional)
            backButtonTitle: undefined, // override the back button title (optional)
            backButtonHidden: false, // hide the back button altogether (optional)
            navigatorStyle: {}, // override the navigator style for the pushed screen (optional)
            navigatorButtons: {} // override the nav buttons for the pushed screen (optional)
        });
    }
}



const actions = {

    fetchLineup: (lineupId: string) => {
        return new Api.Call().withMethod('GET')
            .withRoute(`lists/${lineupId}`)
            .addQuery({
                include: "savings,savings.user"
            });
    },
    fetchSavings: (lineupId: string) => {
        return new Api.Call().withMethod('GET')
            .withRoute(`lists/${lineupId}/savings`)
            .addQuery({
                page: 1,
                include: "*.*"
            });
    },

    deleteSaving: (saving:Saving) => {
        let call = new Api.Call()
            .withMethod('DELETE')
            .withRoute(`savings/${saving.id}`);

        return call.createActionDispatchee(UNSAVE);
    }
};



const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case FETCH_SAVINGS.success(): {
                let {listId, mergeOptions} = action.options;
                let path = `lists.${listId}.relationships.savings.data`;
                state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
                break;
            }
        }
        return state;
    }
})();

let screen = LineupScreen;

export {reducer, screen, actions};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    description: {
        backgroundColor: 'transparent',
        margin: 10
    },
});
