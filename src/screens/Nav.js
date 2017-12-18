import type {Id, Item} from "../types";

export const CLOSE_MODAL = 'close_modal';

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
                    title: "#Choisissez une liste",
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