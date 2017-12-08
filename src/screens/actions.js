// @flow

import * as Api from "../utils/Api";
import ApiAction from "../utils/ApiAction";
import dotprop from "dot-prop-immutable"
import {doDataMergeInState} from "../utils/DataUtils";
import {currentUserId} from "../CurrentUser";
import type {Id, Item} from "../types";

export const FETCH_ITEM = new ApiAction("fetch_item");
export const SAVE_ITEM = new ApiAction("save_item");
export const CREATE_LINEUP = new ApiAction("create_lineup");
export const DELETE_LINEUP = new ApiAction("delete_lineup");
export const EDIT_LINEUP = new ApiAction("edit_lineup");

export function saveItem(itemId: Id, lineupId: Id, privacy = 0, description = '') {

    let body = {
        saving: { list_id: lineupId, privacy}
    };
    if (description) {
        Object.assign(body.saving, {description});
    }
    console.log("saving item, with body:");
    console.log(body);

    let call = new Api.Call()
        .withMethod('POST')
        .withRoute(`items/${itemId}/savings`)
        .withBody(body)
        .addQuery({'include': '*.*'});

    return call.disptachForAction2(SAVE_ITEM, {lineupId});
}

export function fetchItemCall(itemId: Id) {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`items/${itemId}`)
        .addQuery({'include': '*.*'});
}

export function createLineup(listName: string) {

    let call = new Api.Call()
        .withMethod('POST')
        .withRoute("lists")
        .withBody({
            "list": {
                "name": listName
            }
        });

    return call.disptachForAction2(CREATE_LINEUP);
}


export function startAddItem(navigator: *, defaultLineupId: Id) {
    let doublePop = () => {
        navigator.pop({animated: false});
        navigator.pop({animated: false});
    };

    navigator.push({
        screen: 'goodsh.SearchItemsScreen', // unique ID registered with Navigation.registerScreen
        // title: i18n.t("tabs.search.title"),
        passProps: {
            onItemSelected: (item: Item) => {

                navigator.push({
                    screen: 'goodsh.AddItemScreen', // unique ID registered with Navigation.registerScreen
                    title: "Choisissez une liste",
                    passProps: {
                        itemId: item.id,
                        itemType: item.type,
                        item,
                        defaultLineupId,
                        onCancel: () => doublePop(),
                        onAdded: () => doublePop(),
                    },
                });

            },
            onCancel: () => {
                doublePop();
            }

        }, // Object that will be passed as props to the pushed screen (optional)
    });
}

export const reducer = (state = {}, action = {}) => {
    switch (action.type) {
        case CREATE_LINEUP.success(): {
            let userId = currentUserId();
            let {id, type} = action.payload.data;
            let path = `users.${userId}.relationships.lists.data`;
            let goodshboxId = _.get(state, `users.${userId}.relationships.goodshbox.data.id`, null);
            state = doDataMergeInState(state, path, [{id, type}], {afterId: goodshboxId});
            break;
        }

        case DELETE_LINEUP.success(): {
            let userId = currentUserId();
            let {lineupId} = action.options;
            let path = `users.${userId}.relationships.lists.data`;
            let lists = _.get(state, path, null);
            lists = _.filter(lists, (l) => l.id !== lineupId);
            state = dotprop.set(state, path, lists);
            break;
        }
        case SAVE_ITEM.success(): {
            let {id, type} = action.payload.data;
            let {lineupId} = action.options;
            let path = `lists.${lineupId}.relationships.savings.data`;
            let savings = _.get(state, path, null);
            if (savings) {
                savings = savings.slice();
                savings.splice(0, 0, {id, type})
                state = dotprop.set(state, path, savings);
            }
            break;
        }
    }
    return state;
};

