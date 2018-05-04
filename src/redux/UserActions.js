import ApiAction from "../helpers/ApiAction"
import * as Api from "../managers/Api"
import type {Id} from "../types"
import * as actionTypes from "../auth/actionTypes"

const GET_USER = ApiAction.create("get_user", "get the user");

export function getUserAndTheirLists(userId: Id) {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`users/${userId}`)
        .addQuery({
                include: ""
            }
        )
        .createActionDispatchee(GET_USER);
}
