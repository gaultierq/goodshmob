// @flow

//import update from "immutability-helper";
import merge from 'deepmerge'
import type {ms} from "../types";

export const STAT_DURATION = 'STAT_API_REQUEST_TIME';

/*
stat: {
    api: {
        request: {
            [name]: {
                average: avg,
                count: count,
            }
        }
    }
}
*/
export function statReducer(state = {}, action) {

    switch (action.type) {
        case STAT_DURATION:
            action.stats.forEach((s)=> {
                let {category, duration} = s;
                //let {value, path} = stat;
                let value = duration;
                let path= `time.${category}`;

                let {avg, count} = _.get(state, path, {});
                if (!count) {
                    avg = value;
                    count = 1;
                }
                else {
                    count++;
                    avg += (value-avg) / count;
                }
                let stat = _.set({}, path,{avg, count});
                state = merge(state, stat);
            });



            break;
    }
    return state;
}

type StatisticCategory = string;


class _Statistics {
    store: *;

    time = [];
    timeout;

    init(store): _Statistics {
        this.store = store;
        return this;
    }

    recordTime(category: StatisticCategory, duration: ms) {
        this.time.push({category, duration});
        if (this.timeout) return;
        this.timeout = setTimeout(()=> {
            //this.store.dispatch({type: STAT_DURATION, path: `time.${category}`, value: duration});
            this.store.dispatch({type: STAT_DURATION, stats: this.time});
            this.time = [];
        }, 5000);

    }
}

const Statistics = new _Statistics();


export {Statistics};
