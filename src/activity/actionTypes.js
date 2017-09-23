

import * as Api from "../utils/Api";
import * as homeTypes from "../home/actionTypes"

export const FETCH = new Api.ApiAction("fetch");
export const LIKE = new Api.ApiAction("like");
export const UNLIKE = new Api.ApiAction("unlike");

//TODO: dedup
export const LOAD_FEED = homeTypes.LOAD_FEED;
export const LOAD_MORE_FEED = homeTypes.LOAD_MORE_FEED;

