// @flow

import type {Activity, Id, Item, RNNNavigator, User} from "../types";
import {fullName} from "../helpers/StringUtils";
import i18n from '../i18n/i18n';

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



export function seeList(navigator: RNNNavigator, lineup: List) {
    navigator.push({
        screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
        passProps: {
            lineupId: lineup.id,
        },
    });
}

export function seeUser(navigator: RNNNavigator, user: User) {
    navigator.push({
        screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
        title: fullName(user),
        passProps: {
            userId: user.id,
        },
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
