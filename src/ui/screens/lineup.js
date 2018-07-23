// @flow

import React from 'react'
import {Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {
    activityFeedProps,
    FOLLOW_RIGHT_BUTTON,
    getAddButton,
    getNavButtonForAction,
    UNFOLLOW_RIGHT_BUTTON
} from "../UIComponents"
import Immutable from 'seamless-immutable'
import * as Api from "../../managers/Api"
import Feed from "../components/feed"
import type {Id, Lineup, RNNNavigator, Saving} from "../../types"
import {doDataMergeInState} from "../../helpers/DataUtils"
import ActivityCell from "../activity/components/ActivityCell"
import {displayLineupActionMenu, displayShareLineup, seeActivityDetails, startAddItem} from "../Nav"
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
} from "../lineup/actions"
import {UNSAVE} from "../activity/actionTypes"
import * as authActions from "../../auth/actions"
import {GLineupAction, L_ADD_ITEM, L_FOLLOW, L_UNFOLLOW, LineupRights} from "../lineupRights"
import {LINEUP_AND_SAVING_SELECTOR} from "../../helpers/ModelUtils"
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
        console.debug("DEBUG12: all actions", actions)
        return {lineup, savings, actions}
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
    actions: ?GLineupAction[]

    state = {
        navBarState: {}
    }

    componentWillMount() {
        this.unsubscribe = this.props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));

        this.props.navigator.setStyle({
            ...UI.NavStyles,
            navBarCustomView: 'goodsh.LineupNav',
            navBarCustomViewInitialProps: {
                lineupId: this.props.lineupId
            }
        })
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    }

    componentDidAppear() {
        LineupScreen.refreshNavBar(this.props.navigator, this.props.lineupId)
    }

    refreshNavigatorButtons() {
        console.debug('refresh navigator buttons')
        this.props.navigator.setButtons(this.getMainActionButton2(this.props.actions, this.props.lineupId))

    }

    static refreshNavBar(navigator: RNNNavigator, lineupId: ?Id, lineup: ?Lineup) {
        //FIXME: rm platform specific code, https://github.com/wix/react-native-navigation/issues/1871
        // console.debug('refreshing navbar', navBarState)
        if (__IS_IOS__ && lineupId) {
            // if (!navBarState.lineupName) return

        }
        else if (__IS_ANDROID__ && lineup) {
            const user = lineup.user
            let subtitle = () => {
                //FIXME: MagicString
                return user && "par " + fullName(user)
            };
            navigator.setTitle({title: lineup.name});
            navigator.setSubTitle({subtitle: subtitle()});
        }

    }

    //TODO: improve code
    getMainActionButton2(actions: GLineupAction[], lineupId: Id): any {
        let {mains, more} = this.getButtons(actions)

        let rightButtons = mains.map(action => getNavButtonForAction(action, `${lineupId}`))
        if (more.length > 0) {
            rightButtons.push({
                icon: require('../../img2/vertical-dots.png'),
                id: 'more_' + lineupId
            })
        }
        rightButtons.reverse()

        console.debug("lineup " + lineupId + ": buttons:", rightButtons, actions)
        return {rightButtons, fab: {}}
    }

    getButtons(actions) {
        let more = _.sortBy(actions, a => a.priority)
        let _p = 0
        const mains = _.remove(actions, a => {
            if (a.priority <= _p) {
                _p = a.priority
                return true
            }
            return false
        })

        return {mains, more}
    }

// FIXME: terrible hack: watch store, refresh accordingly
    onNavigatorEvent(event) {
        console.debug('onNavigatorEvent', event)
        let lineup = this.props.lineup
        if (event.id === 'add_' + lineup.id) {
            startAddItem(this.props.navigator, lineup.id)
        }
        else if (event.id === 'follow_' + lineup.id) {
            followLineupPending(this.props.dispatch, lineup)
        }
        else if (event.id === 'share_' + lineup.id) {
            displayShareLineup({
                navigator: this.props.navigator,
                lineup: this.props.lineup
            })
        }
        else if (event.id === 'unfollow_' + lineup.id) {
            unfollowLineupPending(this.props.dispatch, lineup)
        }
        else if (event.id === 'more_' + lineup.id) {
            let {more} = this.getButtons(actions)
            displayLineupActionMenu(this.props.navigator, this.props.dispatch, lineup, more)
        }
    }

    // static getDerivedStateFromProps(props: Props, state: State) {
    // }


    render() {
        const {lineup, savings} = this.props

        LineupScreen.refreshNavBar(this.props.navigator, null, lineup)

        //this is not very react compliant, but I didn't find a good way to do it yet
        if (this.props.actions !== this.actions) {
            this.refreshNavigatorButtons()
            this.actions = this.props.actions
        }


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
