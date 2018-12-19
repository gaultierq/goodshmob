// @flow

import type {Node} from 'react'
import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native'

import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import {SearchBar} from 'react-native-elements'
import type {Id, List} from "../../types"
import type {Props as FeedProps} from "../components/feed"
import Feed from "../components/feed"
import {doDataMergeInState} from "../../helpers/DataUtils"
import Screen from "../components/Screen"

import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions"
import * as Api from "../../managers/Api"
import {createCounter} from "../../helpers/DebugUtils"
import {LINEUP_LIST_SELECTOR} from "../../helpers/Selectors"


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
@connect(LINEUP_LIST_SELECTOR())
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


        let lists = this.props.lineups
        debugger;
        //TODO: understand and remove
        lists = _.compact(lists)


        let fetchSrc =  !_.isEmpty(lists) ? {
            callFactory: () => userActions.fetchLineups(userId),
            action: userActionTypes.FETCH_LINEUPS,
            options: {userId}
        } : {
            callFactory: () => userActions.getUserAndTheirLists(userId),
            action: userActionTypes.GET_USER_W_LISTS
        }



        return (
            <Feed
                data={lists}
                listRef={this.props.listRef}
                sections={sectionMaker && sectionMaker(lists)}
                renderItem={this._renderItem}
                fetchSrc={fetchSrc}
                {...attributes}
            />

        )
    }

    _renderItem = ({item}) => {
        return this.props.renderItem(item);
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
