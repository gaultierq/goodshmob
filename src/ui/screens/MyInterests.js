// @flow

import React from 'react'
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
} from 'react-native'

import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import {CheckBox, SearchBar} from 'react-native-elements'
import {Navigation} from 'react-native-navigation'
import Screen from "../components/Screen"
import type {FeedSource} from "../components/feed"
import Feed from "../components/feed"
import * as Api from "../../managers/Api"
import {Call, reduceList2} from "../../managers/Api"
import ApiAction from "../../helpers/ApiAction"
import type {Id} from "../../types"
import {renderSimpleButton, STYLES} from "../UIStyles"
import {GoodshContext, LINEUP_SECTIONS} from "../UIComponents"
import {buildData, updateSplice0} from "../../helpers/DataUtils"
import {FOLLOW_LINEUP, UNFOLLOW_LINEUP} from "../lineup/actions"
import {mergeItemsAndPendings2} from "../../helpers/ModelUtils"
import {Colors} from "../colors"
import {CANCELABLE_MODAL2} from "../Nav"
import {SFP_TEXT_REGULAR} from "../fonts"


type Props = {
};

type State = {
};


@logged
@connect(state => ({
    data: state.data,
    pending: state.pending,
    followed_lists: state.followed_lists,
}))
export default class MyInterests extends Screen<Props, State> {


    followIdsByListIds = {}


    render() {
        const {data, followed_lists, navigator, dispatch, ...attr} = this.props
        let userId = currentUserId()

        let followed = _.slice(followed_lists.list);

        let lists = []
        followed.forEach(f => {
            const follow = buildData(data, 'follows', f.id)
            if (follow) {
                let list = follow.list
                lists.push(list)
                this.followIdsByListIds[list.id] = f.id
            }
        })

        lists = mergeItemsAndPendings2(
            lists,
            this.props.pending[FOLLOW_LINEUP],
            cand => _.some(this.props.pending[UNFOLLOW_LINEUP], o => o.payload.id === cand.id),
            (pending) => buildData(data, 'lists', pending.payload.id) || {}
        );

        let sections = LINEUP_SECTIONS(navigator, dispatch)(lists);

        return (
            <GoodshContext.Provider value={{userOwnResources: false}}>
                <Feed
                    listRef={ref=>ref} //otherwise flow problem??
                    displayName={"MyInterests"}
                    renderSectionHeader={({section}) => section.renderSectionHeader()}
                    sections={sections}
                    ListHeaderComponent={() => (
                        <View style={{marginVertical: 10}}>
                            {
                                renderSimpleButton(
                                    i18n.t('my_interests_screen.search_lists'),
                                    () => this.showSearch(),
                                    {loading: false,
                                        style: {backgroundColor: Colors.green, borderWidth: 0, borderRadius: 4, margin: 12},
                                        textStyle: {fontWeight: "bold", fontSize: 18, color: Colors.white, fontFamily: SFP_TEXT_REGULAR, }})
                            }
                        </View>
                    )}
                    ListEmptyComponent={<Text style={STYLES.empty_message}>{i18n.t('my_interests_screen.empty_screen')}</Text>}

                    fetchSrc={this.fetchSrc(userId)}
                    decorateLoadMoreCall={(sections: any[], call: Call) => {
                        let firstItems = sections.map(s => s.data).map(data => data[0])
                        let lastList = _.findLast(firstItems, list => !!this.followIdsByListIds[list.id])
                        if (lastList) {
                            call.addQuery({id_after: this.followIdsByListIds[lastList.id]})

                        }
                    }
                    }
                    {...attr}
                />
            </GoodshContext.Provider>
        )
    }

    showSearch() {
        let navigator = this.props.navigator;

        navigator.showModal({
            screen: 'goodsh.UserSearchScreen',
            passProps:{
                onClickClose: () => navigator.dismissModal(),
            },
            navigatorButtons: CANCELABLE_MODAL2,
        });
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
export const reducer = (state = {list: []}, action) => {
    switch (action.type) {
        case FOLLOW_LINEUP.success(): {
            let {lineupId} = action.options.scope;
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
            let {lineupId} = action.options.scope;
            state = updateSplice0(state, `list`,
                {
                    deletePredicate: item => item.lineupId === lineupId,
                }
            );
            break;
    }
    return reduceList2(state, action, FETCH_FOLLOWED_LINEUPS, follow => ({lineupId: _.get(follow, 'relationships.list.data.id')}));
};
