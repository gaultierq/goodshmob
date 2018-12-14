// @flow

import type {Node} from 'react'
import React from 'react'
import {
    ActivityIndicator,
    Button,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'

import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {SearchBar} from 'react-native-elements'
import type {Id, List, User} from "../../types"
import type {Props as FeedProps} from "../components/feed"
import Feed from "../components/feed"
import {buildData, doDataMergeInState} from "../../helpers/DataUtils"
import {CREATE_LINEUP, DELETE_LINEUP} from "../lineup/actionTypes"
import {mergeItemsAndPendings} from "../../helpers/ModelUtils"
import Screen from "../components/Screen"

import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions"
import * as Api from "../../managers/Api"
import {createCounter} from "../../helpers/DebugUtils"


export type Props = FeedProps & {
    userId: Id,
    data?: any,
    onCancel?: ()=>void,
    sectionMaker?: (lineups: List<List>) => Array<*>,
    ListHeaderComponent?: Node,
    navigator: *,
    listRef?: any => void | string
};

type State = {
    isLoading?: boolean,
    isLoadingMore?: boolean,
};

const logger = rootlogger.createLogger('lineupList')
const counter = createCounter(logger)

@logged
@connect(state => ({
    data: state.data,
    pending: state.pending
}))
export class LineupListScreen extends Screen<Props, State> {


    constructor(props: Props) {
        super(props);
        this.state = {...super.state, isLoading: false, isLoadingMore: false,}
    }

    render() {
        const {
            userId,
            data,
            onCancel,
            renderItem,
            navigator,
            sectionMaker,
            //ListHeaderComponent,
            ...attributes
        } = this.props;

        counter('render')

        let user: User = buildData(this.props.data, "users", userId);


        let lists = user && user.lists || [];

        let fetchSrc =  !_.isEmpty(lists) ? {
            callFactory: () => userActions.fetchLineups(userId),
            action: userActionTypes.FETCH_LINEUPS,
            options: {userId}
        } : {
            callFactory: () => userActions.getUserAndTheirLists(userId),
            action: userActionTypes.GET_USER_W_LISTS
        }


        //reconciliate pendings
        let items = mergeItemsAndPendings(
            lists,
            this.props.pending[CREATE_LINEUP],
            this.props.pending[DELETE_LINEUP],
            (pending) => ({
                id: pending.id,
                name: pending.payload.listName,
                savings: [],
                type: 'lists', //here ? or reducer ?
                pending: true,
            }),
            {afterI: 0}
        );

        return (
            <Feed
                data={items}
                listRef={this.props.listRef}
                sections={sectionMaker && sectionMaker(items)}
                renderItem={this._renderItem}
                fetchSrc={fetchSrc}
                {...attributes}
            />

        )
    }

    _renderItem = ({item}) => {
        let list = item;
        list = buildData(this.props.data, list.type, list.id) || list;

        let {renderItem} = this.props;

        return renderItem(list);
    }
}

const reducer = (() => {
    const initialState = Api.initialListState()

    let getPath = userId => `users.${userId}.relationships.lists.data`;

    return (state = initialState, action = {}) => {
        switch (action.type) {
            case userActionTypes.FETCH_LINEUPS.success(): {
                let {userId, mergeOptions} = action.options;
                let path = getPath(userId);
                state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
                break;
            }
        }

        return state;
    }
})();

export {reducer}
