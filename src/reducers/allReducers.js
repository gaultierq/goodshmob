import data1 from './dataReducer'
import activity from '../activity/reducer';

import request from './requestReducer'
//import app from '../auth/reducer';
import {reducer as home} from '../screens/home';
import {reducer as lineupList} from '../screens/lineups';
import {reducer as friend} from '../screens/community';
import {reducer as savings} from '../screens/savings';
import {reducer as search} from '../screens/search';
import auth from '../auth/reducer';

let data = reduceReducers(data1, activity);

function reduceReducers(...reducers) {
    return (previous, current) =>
        reducers.reduce(
            (p, r) => r(p, current),
            previous
        );
}


export {
    data,
    request,
    // app,
    home,
    //activity,
    lineupList,
    friend,
    savings,
    auth,
    search
};
