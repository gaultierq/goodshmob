import ApiAction from "../../helpers/ApiAction";

export const FETCH_ITEM = ApiAction.create("fetch_item", "retreived an item");
export const SAVE_ITEM = ApiAction.create("save_item", "saved an item");
export const CREATE_LINEUP = ApiAction.create("create_lineup", "created a lineup");
export const DELETE_LINEUP = ApiAction.create("delete_lineup", "deleted a lineup");
export const EDIT_LINEUP = ApiAction.create("edit_lineup", "renamed a lineup");
