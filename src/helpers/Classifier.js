//@flow


import type {Lineup, Item} from "../types"
import Fuse from "fuse.js"

class Token {

    value: string
    weight: number

    constructor(value: string, weight: number) {
        // if (!value) throw "invalid param"
        this.value = value || ''
        this.weight = weight
    }
}

let getScore = (tokens: Token[]) => {
    let score = new Map()

    ALL_CATEGORIES.forEach(category => {
        let totalScore = tokens.reduce((score, tok) => score + category.score(tok), 0)
        score.set(category, totalScore)
    })
    return score
}

let getScores = (objects: any[], tokenizer: Tokenizer) => {
    let scores = new Map()
    objects.forEach(obj => {
        scores.set(obj, getScore(tokenizer(obj)))
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

let logScores = (name, score) => {
    logger.debug("score for '", name, "' :")
    if (score) {
        let log = "      "
        score.forEach((value, categ) => log += `${categ.name}: ${value}, `)
        logger.debug(log)
    }
    else {
        logger.debug('no score found')
    }
}

const LINEUP_TOKENIZER: Tokenizer<Lineup> = (lineup: Lineup) => [new Token(lineup.name, 1)]

const ITEM_TOKENIZER: Tokenizer<Item> = (item: Item) => {
    const result = [
        new Token(item.title, 1),
        new Token(item.subtitle, 1),
        new Token(item.provider, 3),
    ]
    let desc
    if (desc = item.description) {
        if (desc.tags) {
            result.push(new Token(desc.tags.join(" "), 1))
        }
        if (desc.types) {
            result.push(new Token(desc.types.join(" "), 1))
        }
    }
    return result
}

type Tokenizer<R> = R => Token[]

type ClassifierInput<R, A> = {
    reference: R,
    referenceToTokens: Tokenizer<R>,
    referenceToString?: R => string,

    among: A[],
    amongToTokens: Tokenizer<A>,
    amongToString?: A => string,
}

let classify = (input: ClassifierInput<any, any>) => {
    let amongScores = getScores(input.among, input.amongToTokens)

    //<log amongs
    const amongToString = input.amongToString
    if (amongToString) {
        input.among.forEach(among => {
            logScores(amongToString(among), amongScores.get(among))
        })
    }
    //log/>

    let refScore = getScore(input.referenceToTokens(input.reference))

    let bestItemCategory = getBestCategory(refScore)


    //<log reference
    if (input.referenceToString) {
        logScores(input.referenceToString(input.reference), refScore)
    }
    //log/>

    let iterator, result = null
    // $FlowFixMe
    for (let next of (iterator = amongScores[Symbol.iterator]())) {
        let score = next[1]
        let among = next[0]
        let categ = getBestCategory(score)
        if (categ === bestItemCategory) {
            result = input.among.find(l => l === among)
            break
        }
    }

    return result
}

export function findBestSearchCategory(lineup: Lineup, categories: string[]): ?Lineup {
    let input: ClassifierInput<Item, Lineup> = {
        reference: lineup,
        referenceToTokens: LINEUP_TOKENIZER,
        referenceToString: item => item.name,
        among: categories,
        amongToTokens: s => [new Token(s, 1)],
        amongToString: s => s,
    }

    return classify(input)
}

export function findBestLineup(item: Item, lineups: Lineup[]): ?Lineup {

    let input: ClassifierInput<Item, Lineup> = {
        reference: item,
        referenceToTokens: ITEM_TOKENIZER,
        referenceToString: item => item.title,
        among: lineups,
        amongToTokens: LINEUP_TOKENIZER,
        amongToString: item => item.name,
    }

    return classify(input)
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
