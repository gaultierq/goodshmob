import data1 from './dataReducer'
import activity from '../activity/reducer';

//import request from './requestReducer'
//import app from '../auth/reducer';
import {reducer as network} from '../screens/network';
import {reducer as lineupList} from '../screens/lineups';
import {reducer as friend} from '../screens/community';
import {reducer as savings} from '../screens/savings';
import {reducer as search} from '../screens/search';
import {reducer as comments} from '../screens/comments';
import auth from '../auth/reducer';

function reduceReducers(...reducers) {
    return (previous, current) =>
        reducers.reduce(
            (p, r) => r(p, current),
            previous
        );
}

let data = reduceReducers(
    data1,
    activity,
    comments
);


export {
    data,
    // request,
    network,
    lineupList,
    friend,
    savings,
    auth,
    search,
    // comments
};
