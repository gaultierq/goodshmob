import data from './dataReducer'
import request from './requestReducer'
import app from '../app/reducer';
import {reducer as home} from '../screens/home';
import activity from '../activity/reducer';
import {reducer as lineupList} from '../screens/lineups';
import {reducer as friend} from '../screens/community';

export {
    data,
    request,
    app,
    home,
    activity,
    lineupList,
    friend
};
