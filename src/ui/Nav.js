// @flow

import type {Id, Item, User} from "../types";
import {fullName} from "../helpers/StringUtils";

export const CLOSE_MODAL = 'close_modal';

//if on the right, crash on android (something related to: "frozen", "enabled")
export const CANCELABLE_MODAL = {
    leftButtons: [
        {
            id: CLOSE_MODAL,
            icon: require('../img2/closeXGrey.png')
            //title: "#Cancel"

        }
    ],
    rightButtons: []
};

export const CANCELABLE_SEARCH_MODAL = {
    rightButtons: [
        {
            id: CLOSE_MODAL,
            // icon: require('../img2/closeXGrey.png')
            title: "#Cancel"

        }
    ],
    leftButtons: []
};

export function startAddItem(navigator: *, defaultLineupId: Id) {
    let cancel = () => {
        navigator.dismissModal({animated: false})
    };

    navigator.showModal({
        screen: 'goodsh.SearchItemsScreen', // unique ID registered with Navigation.registerScreen
        // title: i18n.t("tabs.search.title"),
        navigatorButtons: CANCELABLE_SEARCH_MODAL,
        passProps: {
            onItemSelected: (item: Item) => {

                navigator.push({
                    screen: 'goodsh.AddItemScreen', // unique ID registered with Navigation.registerScreen
                    title: "#Choisissez une liste",
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



export function seeList(navigator, lineup: List) {
    navigator.push({
        screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
        passProps: {
            lineupId: lineup.id,
        },
    });
}

export function seeUser(navigator, user: User) {
    navigator.push({
        screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
        title: fullName(user),
        passProps: {
            userId: user.id,
        },
    });
}
