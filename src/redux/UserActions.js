import ApiAction from "../helpers/ApiAction"
import * as Api from "../managers/Api"
import type {Id, User} from "../types"
import {Dispatch} from "redux"
import {Alert} from "react-native"
import _Messenger from "../managers/Messenger"


export const actionTypes = (() => {

    const LOAD_FRIENDS = ApiAction.create("load_friends", "retrieve user friends details");
    const GET_USER_W_FRIENDS = ApiAction.create("get_user_w_friends", "get the user friends list");
    const GET_USER = ApiAction.create("get_user", "get the user");
    const GET_USER_W_LISTS = ApiAction.create("get_user_w_lists", "get user lists of lineups");
    const FETCH_LINEUPS = ApiAction.create("fetch_lineups", "retrieve the user lineups details");

    return {LOAD_FRIENDS, GET_USER_W_FRIENDS, GET_USER, GET_USER_W_LISTS, FETCH_LINEUPS};
})();


export const actions = (() => {
    return {
        fetchFriendsCall: (userId: string) => {

            return new Api.Call().withMethod('GET')
                .withRoute(`users/${userId}/friends`)
                .addQuery({
                    include: "creator"
                });
        },
        getUserAndTheirFriends: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "friends"
                }
            ),
        getUserAndTheirLists: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "lists,lists.savings,lists.savings.resource"
                }
            ),
        fetchLineups: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}/lists`)
            .addQuery({
                    include: "savings,savings.resource"
                }
            ),
        getUser: (userId: Id) => {
            return new Api.Call()
                .withMethod('GET')
                .withRoute(`users/${userId}`)
                .addQuery({
                        include: ""
                    }
                )
        }
    };
})();


export const CONNECT = ApiAction.create("connect", "add a friend");
export const DISCONNECT = ApiAction.create("disconnect", "delete a friend");

export const createFriendship =  (userId: string) => {
    return new Api.Call().withMethod('POST')
        .withRoute(`users/${userId}/friendships`);

}

export const deleteFriendship = (userId: string) => {
    return new Api.Call().withMethod('DELETE')
        .withRoute(`users/${userId}/friendships`);

}

export function disconnectFromUserWithAlert(user: User, ref: any, dispatch: Dispatch<*>) {
    Alert.alert(
        i18n.t("friends.alert.title"),
        i18n.t("friends.alert.label"),
        [
            {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {
                text: i18n.t("actions.ok"), onPress: () => {
                    let action = deleteFriendship(user.id).createActionDispatchee(DISCONNECT)

                    Api.safeDispatchAction.call(
                        ref,
                        dispatch,
                        action,
                        'reqDisconnect'
                    ).then(() => {
                            _Messenger.sendMessage(i18n.t("friends.messages.disconnect"))
                        }
                    )
                }
            },
        ],
        {cancelable: true}
    )
}
