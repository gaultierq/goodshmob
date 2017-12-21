import ApiAction from "../helpers/ApiAction";

export const USER_LOGIN = ApiAction.create('user_login');
export const SAVE_DEVICE = ApiAction.create('save_device');
export const USER_LOGOUT = ApiAction.create('user_logout');
export const SET_USER_NULL = 'SET_USER_NULL';
export const INVALIDATE_CACHE = 'INVALIDATE_CACHE';
export const UPGRADE_CACHE = 'UPGRADE_CACHE';
export const FETCH_ME = ApiAction.create('fetch_me');
