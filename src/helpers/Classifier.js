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

let getScore = tokens => {
    let score = new Map()

    ALL_CATEGORIES.forEach(category => {
        let totalScore = tokens.reduce((score, tok) => score + category.score(tok), 0)
        score.set(category, totalScore)
    })
    return score
}

let getScores = function (tokens) {
    let scores = new Map()
    tokens.forEach(tok => {
        scores.set(tok.id, getScore([tok]))
    })
    return scores
}

let getBestCategory = function (itemScore) {
    let bestCateg = null, currentBest = -1
    itemScore.forEach((value, key) => {
        if (value > currentBest) {
            bestCateg = key
            currentBest = value
        }
    })
    return bestCateg
}

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

const logger = rootlogger.createLogger('classifier')

let logScores = function (name, score) {
    logger.debug("score for", name, ":")
    if (score) {
        let log = "      >>"
        score.forEach((value, categ) => log += `${categ.name}: ${value}, `)
        logger.debug(log)
    }
}

let tokenizeItem = function (item) {
    const result = [
        new Token(item.id, item.title, 1),
        new Token(item.id, item.subtitle, 1),
        new Token(item.id, item.provider, 3),
    ]
    let desc
    if (desc = item.description) {
        if (desc.tags) {
            result.push(new Token(item.id, desc.tags.join(" "), 1))
        }
        if (desc.types) {
            result.push(new Token(item.id, desc.types.join(" "), 1))
        }
    }
    return result
}

export function findBestLineup(item: Item, lineups: Lineup[]): ?Lineup {
    if (!item) return null

    let lineupsScores = getScores(lineups.map(lineup => new Token(lineup.id, lineup.name, 1)))
    let itemScore = getScore(tokenizeItem(item))

    let bestItemCategory = getBestCategory(itemScore)

    lineupsScores.forEach((score, lineupId) => {
        let categ = getBestCategory(score)
        if (categ === bestItemCategory) {
            return lineups.find(l=>l.id === lineupId)
        }
    })

    logger.debug("lineups", _.map(lineups, l => l.title), "lineupsScores", lineupsScores)
    lineups.forEach(lineup => {
        logScores(lineup.name, lineupsScores.get(lineup.id))
    })
    logScores(item.title + ":" + item.id.substr(0, 4), itemScore)

    // $FlowFixMe
    let iterator1 = lineupsScores[Symbol.iterator]()

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

Category.create("music", ["album", "music", "musique", "artist", "spotify"])
Category.create("restaurant", ["restaurant", "food", "café"])
Category.create("tv shows", ["tv-shows", "séries"])
Category.create("movies", ["movie", "film"])
Category.create("books", ["book", "livre"])
