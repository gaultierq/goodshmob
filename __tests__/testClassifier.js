//@flow

import {findBestSearchCategory} from "../src/helpers/Classifier"
import type {Lineup} from "../src/types"
import {SEARCH_ITEM_CATEGORIES} from "../src/helpers/SearchHelper"

//from ruby
const DEFAULT_LIST_NAMES_FR = [
    "Cafés sympas", //0
    "Meilleures terrasses \u{1F60E}", //1
    "Idées cadeaux \u{1F381}", //2
    "Bonnes musiques \u{1F3A7}", //3
    "Livres à lire \u{1F4DA}\u{1F913}", //4
    "Mes restaurants préférés \u{1F60B}", //5
    "Films à voir\u{1F3A5}", //6
    "Meilleures Séries" //7
]

const DEFAULT_SEARCH_CATEGORIES = SEARCH_ITEM_CATEGORIES

const DEFAULT_LISTS: Lineup[] = DEFAULT_LIST_NAMES_FR.map((listName, i) => ({
    id: "default" + i,
    name: listName
}))

test('default lineups to search categories', () => {
    let best = findBestSearchCategory(DEFAULT_LISTS[7], DEFAULT_SEARCH_CATEGORIES)
    expect(_.get(best, 'type')).toBe("movies");
})


// test('default lineups to search categories', () => {
//
//     const EXPECTED_RESULTS = [
//         // "Cafés sympas",
//         "places",
//         // "Meilleures terrasses \u{1F60E}",
//         "places",
//         // "Idées cadeaux \u{1F381}",
//         "consumer_goods",
//         // "Bonnes musiques \u{1F3A7}",
//         "musics",
//         // "Livres à lire \u{1F4DA}\u{1F913}",
//         undefined, //"consumer_goods",
//         // "Mes restaurants préférés \u{1F60B}",
//         "places",
//         // "Films à voir\u{1F3A5}",
//         "movies",
//         // "Meilleures Séries"
//         "movies",
//     ]
//
//
//     DEFAULT_LISTS.forEach((list, index) => {
//         console.log("for: ", list.name, index)
//         let best = findBestSearchCategory(list, DEFAULT_SEARCH_CATEGORIES)
//         expect(_.get(best, 'type')).toBe(EXPECTED_RESULTS[index]);
//     })
// })

// test('item with lineup', () => {
//
//     let item = {
//         id: 'i1',
//         title: 'Super restaurant du quartier'
//     }
//
//     const l1 = {
//         id: 'l1',
//         name: "Mes restaurants vers Bastille"
//     }
//
//     let lineups = [
//         l1
//     ]
//
//     let suitable = findBestLineup(item, lineups)
//     expect(suitable).toBe(l1);
// })

