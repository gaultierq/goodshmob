// @flow

import React from 'react'
import {Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import {activityFeedProps, FOLLOW_RIGHT_BUTTON, getAddButton, UNFOLLOW_RIGHT_BUTTON} from "../UIComponents"
import Immutable from 'seamless-immutable'
import * as Api from "../../managers/Api"
import Feed from "../components/feed"
import type {Activity, Id, Lineup, List, RNNNavigator, Saving, User} from "../../types"
import {buildData, doDataMergeInState} from "../../helpers/DataUtils"
import ActivityCell from "../activity/components/ActivityCell"
import {seeActivityDetails, startAddItem} from "../Nav"
import {Colors} from "../colors"
import Screen from "./../components/Screen"
import * as UI from "../UIStyles"
import {STYLES} from "../UIStyles"
import {fullName} from "../../helpers/StringUtils"
import {
    FETCH_LINEUP,
    FETCH_SAVINGS,
    fetchLineup,
    followLineupPending,
    unfollowLineupPending,
    unfollowLineupPending2
} from "../lineup/actions"
import {UNSAVE} from "../activity/actionTypes"
import * as authActions from "../../auth/actions"
import {GLineupAction, L_ADD_ITEM, L_FOLLOW, L_UNFOLLOW, LineupRights} from "../lineupRights"
import {LINEUP_AND_SAVING_SELECTOR, LINEUP_SECLECTOR} from "../../helpers/ModelUtils"
import {createSelector} from "reselect"


type Props = {
    lineupId: string,
    navigator: any,
    lineup: ?Lineup,
    saving: ?Saving[],
};

type State = {
    title?: {title: string, titleImage: string},
    titleSet?: boolean,
};

export const selector = createSelector(
    [
        LINEUP_AND_SAVING_SELECTOR,
        state => state.pending
    ],
    ({lineup, savings}, pending) => {

        let actions = LineupRights.getActions(lineup, pending)
        let action = null
        if (actions.indexOf(L_ADD_ITEM) >= 0) action = L_ADD_ITEM
        if (actions.indexOf(L_FOLLOW) >= 0) action = L_FOLLOW
        if (actions.indexOf(L_UNFOLLOW) >= 0) action = L_UNFOLLOW

        return {lineup, savings, action}
    }
)

@logged
@connect(selector)
class LineupScreen extends Screen<Props, State> {

    static navigatorStyle = {
        // those props only affect Android
        navBarTitleTextCentered: true,
        navBarSubTitleTextCentered: true,
    }

    unsubscribe: ?() => void

    state = {
        navBarState: {}
    }

    componentWillMount() {
        this.unsubscribe = this.props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    }

    componentDidAppear() {
        LineupScreen.refreshNavBar(this.props.navigator, this.props.lineupId)
    }

    refreshNavigatorButtons() {
        console.debug('refreshNavigatorButtons')
        this.props.navigator.setButtons(this.getMainActionButton2(this.props.action, this.props.lineupId))
    }

    //TODO: improve code
    getMainActionButton(): any {
        const lineup = this.props.lineup
        if (lineup) {
            let actions = LineupRights.getActions(lineup)
            if (actions.indexOf(L_ADD_ITEM) >= 0) return getAddButton(lineup)
            if (actions.indexOf(L_FOLLOW) >= 0) return {rightButtons: [FOLLOW_RIGHT_BUTTON(lineup.id)],}
            // if (actions.indexOf(L_UNFOLLOW) >= 0) return {rightButtons: [UNFOLLOW_RIGHT_BUTTON(lineup.id)],}
        }
        return {rightButtons: [], fab: {}}
    }
    //TODO: improve code
    getMainActionButton2(action: GLineupAction, lineupId: Id): any {

        if (action) {
            if (action === L_ADD_ITEM) return getAddButton(lineupId)
            if (action === L_FOLLOW) return {rightButtons: [FOLLOW_RIGHT_BUTTON(lineupId)],}
            if (action === L_UNFOLLOW) return {rightButtons: [UNFOLLOW_RIGHT_BUTTON(lineupId)],}
        }
        return {rightButtons: [], fab: {}}
    }

    // FIXME: terrible hack: watch store, refresh accordingly
    onNavigatorEvent(event) {
        let lineup = this.props.lineup
        if (!lineup) {
            console.warn("lineup not found")
            return
        }
        if (event.id === 'add') {
            startAddItem(this.props.navigator, lineup)
        }
        else if (event.id === 'follow_' + lineup.id) {
            followLineupPending(this.props.dispatch, lineup)
        }
        else if (event.id === 'unfollow_' + lineup.id) {
            unfollowLineupPending(this.props.dispatch, lineup)
        }
    }

    static refreshNavBar(navigator: RNNNavigator, lineupId: Id) {
        //FIXME: rm platform specific code, https://github.com/wix/react-native-navigation/issues/1871
        // console.debug('refreshing navbar', navBarState)
        if (__IS_IOS__||true) {
            // if (!navBarState.lineupName) return
            navigator.setStyle({
                ...UI.NavStyles,
                navBarCustomView: 'goodsh.LineupNav',
                navBarCustomViewInitialProps: {
                    lineupId
                    // user: navBarState.user,
                    // lineupName: navBarState.lineupName,
                    // lineupCount: navBarState.lineupSavingCount,
                }
            });
        }
        else {
            // let subtitle = () => {
            //     const user = navBarState.user
            //     //FIXME: MagicString
            //     return user && "par " + fullName(user)
            // };
            // navigator.setTitle({title: navBarState.lineupName});
            // navigator.setSubTitle({subtitle: subtitle()});
        }
    }

    // static getDerivedStateFromProps(props: Props, state: State) {
    // }


    render() {
        const {lineup, savings} = this.props

        this.refreshNavigatorButtons()

        let fetchSrc;
        if (lineup && lineup.savings) {
            fetchSrc = {
                callFactory:()=>actions.fetchSavings(this.props.lineupId),
                action:FETCH_SAVINGS,
                options: {listId: this.props.lineupId}
            };
        }
        else {
            fetchSrc = {
                callFactory:() => fetchLineup(this.props.lineupId),
                action: FETCH_LINEUP,
                options: {listId: this.props.lineupId}
            };
        }

        return (
            <View style={styles.container}>
                {lineup && lineup.description && <Text style={[styles.description]}>{lineup.description}</Text>}
                <Feed
                    data={savings}
                    renderItem={item => this.renderItem(item, lineup)}
                    fetchSrc={fetchSrc}
                    hasMore={true}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t("empty.lineup")}</Text>}
                    {...activityFeedProps()}
                />
            </View>
        );
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

    renderItem(item, lineup) {
        let saving: Saving = item.item;

        if (!saving['built']) return null;

        return (
            <ActivityCell
                activity={saving}
                activityType={saving.type}
                // skipLineup={true}
                // skipDescription={true}
                onPressItem={() => seeActivityDetails(this.props.navigator, saving)}
                navigator={this.props.navigator}
            />
        )
    }
}



const actions = {

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
