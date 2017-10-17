

import * as Api from "../utils/Api";
import ApiAction from "../utils/ApiAction";


export const SAVE_ITEM = new ApiAction("save_item");

export function saveItem(itemId: Id, lineupId: Id, privacy = 0, description = '') {

    let body = {
        saving: { list_id: lineupId, privacy}
    };
    if (description) {
        Object.assign(body, description)
    }
    console.log("saving item, with body:");
    console.log(body);

    let call = new Api.Call()
        .withMethod('POST')
        .withRoute(`items/${itemId}/savings`)
        .withBody(body)
        .addQuery({'include': '*.*'});

    return call.disptachForAction2(SAVE_ITEM);
}