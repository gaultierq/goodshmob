// @flow

import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import {activityFeedProps} from "../UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import Feed from "../components/feed";
import type {List, Saving} from "../../types";
import {buildData, doDataMergeInState} from "../../helpers/DataUtils";
import ApiAction from "../../helpers/ApiAction";
import ActivityCell from "../activity/components/ActivityCell";
import ActionButton from 'react-native-action-button';
import {startAddItem} from "../Nav";
import {Colors} from "../colors";
import Screen from "./../components/Screen";


type Props = {
    lineupId: string,
    navigator: any
};

type State = {
    title: null|{title: string, titleImage: string},
    titleSet: boolean
};

const FETCH_LINEUP = ApiAction.create("fetch_lineup");
const FETCH_SAVINGS = ApiAction.create("fetch_savings");
const DELETE_SAVING = ApiAction.create("delete_saving");

@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
class LineupScreen extends Screen<Props, State> {


    //titleSet because when navigating back, a render may change the nav bar title. this is a flaw in wix nav
    state = {title: null, titleSet: false};

    render() {
        const lineup = this.getLineup();

        //FIXME: this is shit
        if (!this.state.titleSet) {
            if (this.state.title) {
                this.setState({titleSet: true}, () => this.props.navigator.setTitle(this.state.title));
            }
            else if (lineup) {
                //let user:User = lineup.user;
                let title = lineup.name;
                let titleImage = /*user.goodshbox.id === lineup.id ? require('../../img/goodshbox.png') : */null;
                this.props.navigator.setTitle({title, titleImage});
                this.setState({title: {title, titleImage}});
                let user = lineup.user;
                if (user && user.id !== currentUserId()) {
                    this.props.navigator.setSubTitle({
                        subtitle: "Par " + user.firstName + " " + user.lastName
                    });
                }
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
                <Feed
                    data={savings}
                    renderItem={item => this.renderItem(item, lineup)}
                    fetchSrc={fetchSrc}
                    hasMore={true}
                    empty={"empty.lineup"}
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
                skipLineup={true}
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
            title: i18n.t("home_search_screen.saving.title"), // navigation bar title of the pushed screen (optional)
            titleImage: require('../../img2/headerLogoBlack.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
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
                per_page: 10,
                include: "*.*"
            });
    },

    deleteSaving: (saving:Saving) => {
        let call = new Api.Call()
            .withMethod('DELETE')
            .withRoute(`savings/${saving.id}`);

        return call.disptachForAction2(DELETE_SAVING);
    }
};



const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case FETCH_SAVINGS.success(): {
                let {listId} = action.options;
                let path = `lists.${listId}.relationships.savings.data`;
                state = doDataMergeInState(state, path, action.payload.data);
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
        //marginTop: 100
    },
    description: {
        backgroundColor: 'transparent',
        margin: 10
    },
});
