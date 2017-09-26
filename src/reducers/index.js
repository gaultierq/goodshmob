import data from './dataReducer'
import request from './requestReducer'
import app from '../app/reducer';
import {reducer as home} from '../screens/home';
import activity from '../activity/reducer';
import lineup from '../lineup/reducer';
import friend from '../friend/reducer';

export {
    data,
    request,
    app,
    home,
    activity,
    lineup,
    friend
};
