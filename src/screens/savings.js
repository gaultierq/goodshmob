// @flow

import React, {Component} from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import type {List, Saving, User} from "../types";
import {buildNonNullData, doDataMergeInState} from "../utils/DataUtils";
import ApiAction from "../utils/ApiAction";
import ActivityCell from "../activity/components/ActivityCell";


type Props = {
    lineupId: string,
    navigator: any
};

type State = {
    title: null|{title: string, titleImage: string},
    titleSet: boolean
};

class SavingsScreen extends Component<Props, State> {


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
                let titleImage = /*user.goodshbox.id === lineup.id ? require('../img/goodshbox.png') : */null;
                this.props.navigator.setTitle({title, titleImage});
                this.setState({title: {title, titleImage}});
            }
        }


        let empty = (!lineup.savings || !lineup.savings.length);
        return (
            <MainBackground>
                <View style={styles.container}>
                    {lineup.description && <Text style={[styles.description]}>{lineup.description}</Text>}
                    <Feed
                        data={lineup.savings}
                        renderItem={item => this.renderItem(item, lineup)}
                        fetchSrc={{
                            callFactory:()=>actions.loadSavings(this.props.lineupId),
                            action:actionTypes.LOAD_SAVINGS,
                            options: {listId: this.props.lineupId}
                        }}
                        hasMore={true}
                        empty={"Cette liste est vide"}
                    />

                </View>
            </MainBackground>
        );
    }

    getLineup() : List {
        return /*this.props.lineup || */buildNonNullData(this.props.data, "lists", this.props.lineupId);
    }

    renderItem(item, lineup) {
        let saving: Saving = item.item;

        if (!saving['built']) return null;

        return (
            <ActivityCell
                activityId={saving.id}
                activityType={saving.type}
                skipLineup={true}
                skipDescription={true}
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
            title: "Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../img/screen_title_home.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
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


const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});


const actionTypes = (() => {

    const LOAD_SAVINGS = new ApiAction("load_savings");
    const DELETE_SAVING = new ApiAction("delete_saving");

    return {LOAD_SAVINGS, DELETE_SAVING};
})();


const actions = (() => {
    return {

        loadSavings: (lineupId: string) => {
            return new Api.Call().withMethod('GET')
                .withRoute(`lists/${lineupId}/savings`)
                .addQuery({
                    page: 1,
                    per_page: 10,
                    include: "*.*"
                });

        },
        deleteSaving: (saving:types.Saving) => {
            let call = new Api.Call()
                .withMethod('DELETE')
                .withRoute(`savings/${saving.id}`);

            return call.disptachForAction2(actionTypes.DELETE_SAVING);
        }
    };
})();


// const reducer = (() => {
//     const initialState = Immutable(Api.initialListState());
//
//     return (state = initialState, action = {}) => {
//         let desc = {fetchFirst: actionTypes.LOAD_SAVINGS, fetchMore: actionTypes.LOAD_MORE_SAVINGS};
//         return Api.reduceList(state, action, desc);
//     }
// })();


const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case actionTypes.LOAD_SAVINGS.success(): {
                let {listId} = action.options;
                let path = `lists.${listId}.relationships.savings.data`;

                state = doDataMergeInState(state, path, action.payload.data);
                break;
            }
            // case actionTypes.ADD_COMMENT.success(): {
            //
            //     let {id, type} = action.payload.data;
            //     let {activityId, activityType} = action.options;
            //     activityType = sanitizeActivityType(activityType);
            //
            //     let path = `${activityType}.${activityId}.comments.data`;
            //     state = doDataMergeInState(state, path, [{id, type}]);
            //     break;
            // }

        }
        //let desc = {fetchFirst: actionTypes.LOAD_COMMENTS};
        //return Api.reduceList(state, action, desc);
        return state;
    }
})();

let screen = connect(mapStateToProps)(SavingsScreen);

export {reducer, screen, actions};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    description: {
        backgroundColor: 'transparent',
        margin: 10
    },
});
