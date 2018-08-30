//@flow


import type {Item, Lineup} from "../types"
import Fuse from "fuse.js"
import type {SearchCategory} from "./SearchConstants"

class Token {

    value: string
    weight: number

    constructor(value: string, weight: number) {
        // if (!value) throw "invalid param"
        this.value = value || ''
        this.weight = weight
    }
}

let getScore = (tokens: Token[]): Score => {
    let score = new Map()

    CLASSIFIER_CATEGORIES.forEach(category => {
        let totalScore = tokens.reduce((score, tok) => score + category.score(tok), 0)
        score.set(category, totalScore)
    })
    return score
}

type Score = Map<Category, number>

let getScores = <T> (objects: T[], tokenizer: Tokenizer<T>): Map<T, Score> => {
    let scores = new Map()
    objects.forEach(obj => {
        scores.set(obj, getScore(tokenizer(obj)))
    })
    return scores
}

// let getBestCategory = itemScore => {
//     let bestCateg = null, currentBest = 0
//     itemScore.forEach((value, key) => {
//         if (value > currentBest) {
//             bestCateg = key
//             currentBest = value
//         }
//     })
//     return bestCateg
// }

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
    let log = "score for '"+ name + "' :"
    score && score.forEach((value, categ) => log += `${categ.name}: ${value}, `)
    logger.debug(log)
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

const SEARCH_CATEGORY_TOKENIZER: Tokenizer<SearchCategory> = (category: SearchCategory) => {
    const result = [
        new Token(category.tabName, 3),
    ]
    if (category.description) {
        result.push(new Token(category.description, 1))
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

    let refScore: Score = getScore(input.referenceToTokens(input.reference))

    //<log reference
    if (input.referenceToString) {
        logScores("ref=" + input.referenceToString(input.reference), refScore)
    }
    //log/>

    let amongScores = getScores(input.among, input.amongToTokens)

    //<log amongs
    const amongToString = input.amongToString
    if (amongToString) {
        input.among.forEach(among => {
            logScores(amongToString(among), amongScores.get(among))
        })
    }
    //log/>


    let totalScores = []
    amongScores.forEach((amongScore, among) => {
        let mult = multiply(refScore, amongScore)
        totalScores.push({
            among,
            totalScore: sum(mult)
        })
    })


    const bestAmong = _.get(_.maxBy(totalScores.filter(o => o.totalScore > 0), o => o.totalScore), 'among')
    logger.debug("best category:", "*" + (bestAmong && input.amongToString(bestAmong)) + "*", "total scores", totalScores)
    return bestAmong
}

function multiply(left: Score, right: Score): Score {
    let result = new Map
    left.forEach((lv, lk) => {
        let rv = right.get(lk) || 0
        result.set(lk, rv * lv)
    })
    return result
}

function sum(score) {
    let result = 0
    score.forEach(value => {
        result += value
    })
    return result
}

export function findBestSearchCategory(lineup: Lineup, categories: SearchCategory[]): ?Lineup {
    let input: ClassifierInput<Item, SearchCategory> = {
        reference: lineup,
        referenceToTokens: LINEUP_TOKENIZER,
        referenceToString: item => item.name,
        among: categories,
        amongToTokens: SEARCH_CATEGORY_TOKENIZER,
        amongToString: s => s.type,
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

let CLASSIFIER_CATEGORIES : Category[] = []

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
        CLASSIFIER_CATEGORIES.push(category)
        return category
    }

    score(token: Token): number {
        let score = 0

        const values = token.value.split(" ")
        values.forEach(word => {
            score += this.fuse.search(word).length * token.weight
        })
        return score
    }
}

Category.create("music", ["album", "music", "musique", "artist", "spotify"])
Category.create("restaurant", ["restaurant", "food", "café", "place", "terrasse"])
Category.create("tv shows", ["tv-shows", "séries"])
Category.create("movies", ["movie", "film"])
Category.create("books", ["book", "livre"])
