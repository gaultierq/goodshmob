//@flow


import type {Lineup, Item} from "../types"
import Fuse from "fuse.js"

class Token {

    id: string
    value: string
    weight: number


    constructor(id: string, value: string, weight: number) {
        this.id = id
        this.value = value
        this.weight = weight
    }
}

let getScore = tok => {
    let score = new Map()
    ALL_CATEGORIES.forEach(category => {
        score.set(category, category.score(tok))
    })
    return score
}

let getScores = function (tokens) {
    let scores = new Map()
    tokens.forEach(tok => {
        scores.set(tok.id, getScore(tok))
    })
    return scores
}

let getBestCategory = function (itemScore) {
    let bestCateg, currentBest = -1
    itemScore.forEach((value, key) => {
        if (value > currentBest) bestCateg = key
    })
}

export function findSuitableLineup(item: Item, lineups: Lineup[]): ?Lineup {
    if (!item) return null

    /*
    lineupScores: {
         1234-5678: {
                music: 19
                films: 1
                restaurant: 0
            },
         5321-1234: {
                music: 15
                films: 23
                restaurant: 0
            },
        }
     */

    let lineupScores = getScores(lineups.map(lineup => new Token(lineup.id, lineup.name, 1)))
    let itemScore = getScore(new Token(item.id, item.title, 1))

    let bestItemCategory = getBestCategory(itemScore)

    lineupScores.forEach((score, lineupId) => {
        let categ = getBestCategory(score)
        if (categ === bestItemCategory) {
            return lineups.find(l=>l.id === lineupId)
        }
    })

    console.log("Classifier:", "lineups", lineups, "lineupScores", lineupScores)
    console.log("Classifier:", "item", item, "itemScore", itemScore, "bestItemCategory", bestItemCategory)

    // $FlowFixMe
    var iterator1 = lineupScores[Symbol.iterator]();

    for (let item of iterator1) {
        let score = item[1]
        let lineupId = item[0]
        let categ = getBestCategory(score)
        if (categ === bestItemCategory) {
            return lineups.find(l=>l.id === lineupId)
        }
    }

    return null
}



let ALL_CATEGORIES : Category[] = []

class Category {

    name: string
    tokens: string[]
    fuse: any

    constructor(name: string, tokens: string[]) {
        this.name = name
        this.tokens = tokens
        let options = {
            shouldSort: true,
            threshold: 0.2,
            location: 0,
            distance: 3,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            // keys: [
            //     "title",
            //     "author.firstName"
            // ]
        }
        this.fuse = new Fuse(this.tokens, options) // "list" is the item array
    }

    static create(name: string, tokens: string[]) {
        const category = new Category(name, tokens)
        ALL_CATEGORIES.push(category)
        return category
    }

    score(token: Token): number {
        let score = 0

        const values = token.value.split(" ")
        values.forEach(word => {
            score += this.fuse.search(word).length
        })
        return score
    }
}

Category.create("music", ["album", "music", "artist", "spotify"])
Category.create("restaurant", ["restaurant", "food", "café"])
