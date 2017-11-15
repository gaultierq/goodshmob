
export function createResultFromHit(hits, options = {}) {
    let {filterItems} = options;

    let searchResult = [];
    let listsById: { [Id]: List } = {};
    hits.forEach((h) => {
        let hR = h["_highlightResult"];
        let matchedListName = hR["list_name"] && hR["list_name"]["matchLevel"] !== 'none';
        let matchedItemTitle = hR["item_title"] && hR["item_title"]["matchLevel"] !== 'none';

        const {
            objectID,
            list_name,
            item_title,
            list_id,
            user_id,
            type,
            image,
            url,
            user
        } = h;

        let saving = {
            id: objectID,
            user: Object.assign({type: "users"}, user, {id: user_id}),
            resource: {type, image, url, title: item_title},
            type: "savings"
        };

        if (matchedListName) {
            let list = listsById[list_id];
            if (!list) {
                list = {
                    id: list_id,
                    name: list_name,
                    user: Object.assign({type: "users"}, user, {id: user_id}),
                    type: "lists",
                    savings: []
                };
                listsById[list_id] = list;

                //adding to the result for 1st match
                searchResult.push(list);
            }
            list.savings.push(saving);
        }

        //if matching a list, algolia will also notify us the item_title matching
        if (matchedItemTitle && !filterItems) {
            searchResult.push(saving);
        }
    });
    return searchResult;
}
export function createResultFromHit2(hits, options = {}) {

    return hits.map((h) => {

        const {
            objectID,
            first_name,
            last_name,
            email,
            image,
        } = h;

        return {
            id: objectID,
            firstName: first_name,
            lastName: last_name,
            email,
            image,
            type: "users"
        };


    });
}