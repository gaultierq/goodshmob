//@flow

import {findSuitableLineup} from "../src/helpers/Classifier"


test('item with lineup', () => {

    let item = {
        title: 'Super restaurant du quartier'
    }

    const l1 = {
        id: 1,
        name: "Mes restaurants vers Bastille"
    }

    let lineups = [
        l1
    ]

    let suitable = findSuitableLineup(item, lineups)
    expect(suitable).toBe(l1);
})

