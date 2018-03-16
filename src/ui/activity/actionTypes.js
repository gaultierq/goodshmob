import ApiAction from "../../helpers/ApiAction";

export const FETCH_ACTIVITY = ApiAction.create("fetch_activity", "retrieved an activity");
export const CREATE_LIKE = ApiAction.create("like", "liked an activity");
export const DELETE_LIKE = ApiAction.create("unlike", "unliked an activity");
export const UNSAVE = ApiAction.create("unsave", "delete an activity");
