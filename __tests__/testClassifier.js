//@flow

import {findBestLineup} from "../src/helpers/Classifier"


test('item with lineup', () => {

    let item = {
        id: 'i1',
        title: 'Super restaurant du quartier'
    }

    const l1 = {
        id: 'l1',
        name: "Mes restaurants vers Bastille"
    }

    let lineups = [
        l1
    ]

    let suitable = findBestLineup(item, lineups)
    expect(suitable).toBe(l1);
})

