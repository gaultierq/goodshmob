import ApiAction from "../helpers/ApiAction";

export const USER_LOGIN = ApiAction.create('user_login', 'user logged in with facebook');
export const SAVE_DEVICE = ApiAction.create('save_device', 'save new device information');
export const USER_LOGOUT = ApiAction.create('user_logout', 'user logged out');
export const SET_USER_NULL = 'SET_USER_NULL';
export const CLEAR_CACHE = 'CLEAR_CACHE';
export const INIT_CACHE = 'INIT_CACHE';
export const UPGRADE_CACHE = 'UPGRADE_CACHE';
export const FETCH_ME = ApiAction.create('fetch_me', 'get user information');
