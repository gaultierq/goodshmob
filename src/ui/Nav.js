// @flow

import type {Activity, ActivityType, Id, Item, Lineup, RNNNavigator, User} from "../types";
import {fullName} from "../helpers/StringUtils";
import StoreManager from "../managers/StoreManager";
import i18n from '../i18n/i18n';
import BottomSheet from 'react-native-bottomsheet';
import {unsaveOnce} from "./activity/components/ActivityActionBar";
import {sanitizeActivityType} from "../helpers/DataUtils";
import {View} from "react-native";
import type {Description, Visibility} from "./screens/save";
import * as Api from "../managers/Api";
import ApiAction from "../helpers/ApiAction";
import Config from "react-native-config";
import ItemCell from "./components/ItemCell";
import React from "react";
import {LineupH1} from "./components/LineupHorizontal";
import LineupHorizontal from "./components/LineupHorizontal";
import LineupCellSaving from "./components/LineupCellSaving";

export const CLOSE_MODAL = 'close_modal';

//if on the right, crash on android (something related to: "frozen", "enabled")
export const CANCELABLE_MODAL = {
    leftButtons: [
        {
            id: CLOSE_MODAL,
            icon: require('../img2/closeXGrey.png')
        }
    ],
    rightButtons: []
};

export const CANCELABLE_SEARCH_MODAL = () => ({
    rightButtons: __IS_ANDROID__ ? [] : [
        {
            id: CLOSE_MODAL,
            title: i18n.t("actions.cancel")

        }
    ],
    leftButtons: []
});

export function startAddItem(navigator: *, defaultLineupId: Id) {
    let cancel = () => {
        navigator.dismissAllModals()
    };

    navigator.showModal({
        screen: 'goodsh.SearchItemsScreen', // unique ID registered with Navigation.registerScreen
        navigatorButtons: CANCELABLE_SEARCH_MODAL(),
        passProps: {
            onItemSelected: (item: Item, navigator: RNNNavigator) => {

                navigator.showModal({
                    screen: 'goodsh.AddItemScreen',
                    title: i18n.t("add_item_screen.title"),
                    animationType: 'none',
                    passProps: {
                        itemId: item.id,
                        itemType: item.type,
                        item,
                        defaultLineupId,
                        onCancel: cancel,
                        onAdded: cancel,
                    },
                });

            },
            onCancel: cancel
        }, // Object that will be passed as props to the pushed screen (optional)
    });
}



export function seeList(navigator: RNNNavigator, lineup: Lineup) {

    navigator.showModal({
        screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
        passProps: {
            lineupId: lineup.id,
        },
        navigatorButtons: CANCELABLE_MODAL
    });
}

export function seeUser(navigator: RNNNavigator, user: User) {
    navigator.showModal({
        screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
        title: fullName(user),
        passProps: {
            userId: user.id,
            user
        },
        navigatorButtons: CANCELABLE_MODAL
    });
}

export function seeComments(navigator: RNNNavigator, activity: Activity) {
    navigator.push({
        screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
        // title: fullName(user),
        passProps: {
            activityId: activity.id,
            activityType: activity.type,
            autoFocus: true
        },
    });
}

export function seeActivityDetails(navigator: RNNNavigator, activity: Activity) {
    navigator.showModal({
        screen: 'goodsh.ActivityDetailScreen',
        passProps: {activityId: activity.id, activityType: activity.type},
        // navigatorButtons: Nav.CANCELABLE_MODAL,
    });
}


//FIXME: check for rights (if activity not in cache, display something, request + loader)
export function displayActivityActions(navigator: RNNNavigator, dispatch: *, activityId: Id, activityType: ActivityType) {
    BottomSheet.showBottomSheetWithOptions({
        options: [
            i18n.t("actions.change_description"),
            i18n.t("actions.move"),
            i18n.t("actions.delete"),
            i18n.t("actions.cancel")
        ],
        title: i18n.t("actions.edit_saving_menu"),
        destructiveButtonIndex: 2,
        cancelButtonIndex: 3,
    }, (value) => {
        switch (value) {
            case 0:

                navigator.showModal({
                    screen: 'goodsh.ChangeDescriptionScreen',
                    animationType: 'none',
                    passProps: {
                        activityId,
                        activityType,
                    }
                });
                break;
            case 1:
                navigator.showModal({
                    screen: 'goodsh.MoveInScreen',
                    title: i18n.t('create_list_controller.choose_another_list'),
                    passProps: {
                        savingId: activityId,
                    },
                    navigatorButtons: CANCELABLE_MODAL,
                });
                break;
            case 2:
                let activity = StoreManager.buildData(activityType, activityId);
                unsaveOnce(activity, dispatch);
                break;
        }
    });
}

export function displayShareItem(navigator: RNNNavigator, activity: Activity) {

    const {resource} = activity;


    const url = `${Config.SERVER_URL + sanitizeActivityType(activity.type)}/${activity.id}`;

    const params = {
        renderSharedObject: ()=>(<View style={{height: 100, }}><ItemCell item={resource}/></View>),
        sendAction: (friend: User, description?: string) => {
            sendItem(resource.itemId, friend, description).disptachForAction2(SEND_ITEM)
        },
        createShareIntent: () => this.createShareIntent(resource, url),
        urlForClipboard: ()=> url,
    }

    navigator.showModal({
        screen: 'goodsh.ShareScreen', // unique ID registered with Navigation.registerScreen
        animationType: 'none',
        passProps:{
            onClickClose: () => navigator.dismissModal({animationType: 'none',}),
            ...params,
        },
        navigatorStyle: {navBarHidden: true},
    });
}

export function displayShareLineup(navigator: RNNNavigator, lineup: Lineup) {
    let userId = _.get(lineup, 'user.id');
    let lineupId = _.get(lineup, 'id');
    if (!userId || !lineupId) return; //TODO: error

    const url = `${Config.SERVER_URL}lists/${lineupId}`;

    const params = {
        renderSharedObject: () => (<LineupHorizontal
            lineupId={lineup.id}
            navigator={navigator}
            withLineupTitle={true}
            style={{flex: 1}} //TODO: why do we need this ? //TODO: design
            renderSaving={saving => <LineupCellSaving item={saving.resource} />}
        />),
        sendAction: null,
        createShareIntent: null/*() => this.createShareIntent(resource, url)*/,
        urlForClipboard: ()=> url,
    }

    navigator.showModal({
        screen: 'goodsh.ShareScreen', // unique ID registered with Navigation.registerScreen
        animationType: 'none',
        passProps:{
            onClickClose: () => navigator.dismissModal({animationType: 'none',}),
            ...params,
        },
        navigatorStyle: {navBarHidden: true},
    });
}

//TODO: move this somewhere
const SEND_ITEM = ApiAction.create("send_item", "add a note to an item");
function sendItem(itemId: Id, user: User, description?: Description = "", privacy?: Visibility = 0){

    let body = {
        sending: {
            receiver_id: user.id,
            description,
            privacy
        }
    };

    return new Api.Call().withMethod('POST')
        .withRoute(`items/${itemId}/sendings`)
        .withBody(body)
        .addQuery({
            include: "*.*"
        });
};

