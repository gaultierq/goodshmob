// @flow

import React from 'react';
import {
    Alert,
    BackHandler,
    Button,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {connect} from "react-redux";
import {currentUserId, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation';
import Screen from "../components/Screen";
import Feed from "../components/feed";
import * as Api from "../../managers/Api";
import {reduceList2} from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";
import type {Id, Lineup} from "../../types";
import {STYLES} from "../UIStyles";
import {GoodshContext, LINEUP_SECTIONS} from "../UIComponents";
import {buildData, updateSplice0} from "../../helpers/DataUtils";
import {FOLLOW_LINEUP, UNFOLLOW_LINEUP} from "../lineup/actions";
import type {FeedSource} from "../components/feed";
import {Call} from "../../managers/Api";


type Props = {
};

type State = {
};


@logged
@connect(state => ({
    data: state.data,
    followed_lists: state.followed_lists,
}))
export default class MyInterests extends Screen<Props, State> {


    followIdsByListIds = {}


    render() {
        const {data, followed_lists, navigator, dispatch, ...attr} = this.props
        let userId = currentUserId()

        let followed = _.slice(followed_lists.list);

        const lists = []
        followed.forEach(f => {
            let list = buildData(data, 'follows', f.id).list
            lists.push(list)
            this.followIdsByListIds[list.id] = f.id
        })

        return (
            <GoodshContext.Provider value={{userOwnResources: false}}>
                <Feed
                    listRef={ref=>ref} //otherwise flow problem???
                    displayName={"MyInterests"}
                    data={followed}
                    renderSectionHeader={({section}) => section.renderSectionHeader()}
                    sections={LINEUP_SECTIONS(navigator, dispatch, userId)(lists)}
                    empty={<View><Text style={STYLES.empty_message}>{i18n.t('community_screen.empty_screen')}</Text></View>}
                    fetchSrc={this.fetchSrc(userId)}
                    decorateLoadMoreCall={(last: any, call: Call) => {
                        const lastLineup = last.data[0];
                        return call.addQuery({id_after: this.followIdsByListIds[lastLineup.id]})
                    }
                    }
                    {...attr}
                />
            </GoodshContext.Provider>
        )
    }

    fetchSrc(userId: Id): FeedSource {
        return {
            callFactory: () => fetchFollowedLineups(userId),
            action: FETCH_FOLLOWED_LINEUPS,
            options: {userId}
        }
    }

}

const FETCH_FOLLOWED_LINEUPS = ApiAction.create("fetch_followed_lineups", "retrieve the user followed lineups details");

const fetchFollowedLineups =  userId => new Api.Call()
    .withMethod('GET')
    .withRoute(`users/${userId}/followed_lists`)
    .include('savings')



// export const reducer = reducerFactory(FETCH_FOLLOWED_LINEUPS)
export const reducer = (state = {}, action) => {
    switch (action.type) {
        case FOLLOW_LINEUP.success(): {
            let {lineupId} = action.options;
            let {id, type} = action.payload.data

            state = updateSplice0(state, `list`,
                {
                    index: 0,
                    insert: {
                        id, type, lineupId
                    },
                }
            );
            break;
        }
        case UNFOLLOW_LINEUP.success():
            let {lineupId} = action.options;
            state = updateSplice0(state, `list`,
                {
                    deletePredicate: item => item.lineupId === lineupId,
                }
            );
            break;
    }
    return reduceList2(state, action, FETCH_FOLLOWED_LINEUPS, follow => ({lineupId: _.get(follow, 'relationships.list.data.id')}));
};