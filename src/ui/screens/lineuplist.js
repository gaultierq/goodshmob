// @flow

import type {Node} from 'react';
import React from 'react';
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
} from 'react-native';

import {connect} from "react-redux";
import {isCurrentUserId, logged} from "../../managers/CurrentUser"
import type {Id, List, User} from "../../types";
import type {Props as FeedProps} from "../components/feed";
import Feed from "../components/feed";
import {buildData, doDataMergeInState} from "../../helpers/DataUtils";
import {CREATE_LINEUP, DELETE_LINEUP} from "../lineup/actionTypes";
import {mergeItemsAndPendings} from "../../helpers/ModelUtils";
import Screen from "../components/Screen";
import {actions as userActions, actionTypes as userActionTypes} from "../../redux/UserActions"
import {GoodshContext} from "../UIComponents"
import Immutable from 'seamless-immutable'
import LineupCell from "../components/LineupCell";
import * as Api from "../../managers/Api";
import GTouchable from "../GTouchable";


export type Props = FeedProps<List> & {
    userId: Id,
    data?: any,
    onCancel?: ()=>void,
    sectionMaker?: (lineups: List<List>) => Array<*>,
    ListHeaderComponent?: Node,
    renderItem: (item: *)=>Node,
    navigator: *,
    listRef: any => void | string
};

type State = {
    isLoading?: boolean,
    isLoadingMore?: boolean,
};



@logged
@connect(state => ({
    data: state.data,
    pending: state.pending
}))
export class LineupListScreen extends Screen<Props, State> {


    constructor(props) {
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


        let user: User = buildData(this.props.data, "users", userId);


        let lists = user && user.lists || [];

        let fetchSrc =  !_.isEmpty(lists) ? {
            callFactory: () => userActions.fetchLineups(userId),
            action: userActionTypes.FETCH_LINEUPS,
            options: {userId}
        } : {
            callFactory: () => userActions.getUserAndTheirLists(userId),
            action: userActionTypes.GET_USER_W_LISTS
        };


        //reconciliate pendings
        let items = mergeItemsAndPendings(
            lists,
            this.props.pending[CREATE_LINEUP],
            this.props.pending[DELETE_LINEUP],
            (pending) => ({
                id: pending.id,
                name: pending.payload.listName,
                savings: [],
                type: 'lists' //here ? or reducer ?
            }),
            {afterI: 0}
        );

        return (
            <GoodshContext.Provider value={{userOwnResources: isCurrentUserId(userId)}}>
                <Feed
                    data={items}
                    listRef={this.props.listRef}
                    sections={sectionMaker && sectionMaker(items)}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={fetchSrc}
                    {...attributes}
                />

            </GoodshContext.Provider>
        )
    }

    renderItem({item}) {
        let list = item;
        list = buildData(this.props.data, list.type, list.id) || list;

        let {renderItem, navigator} = this.props;

        return (renderItem || renderSimpleListItem(navigator))(list);
    }
}

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

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


export {reducer};

//TODO: REMOVE
export function renderSimpleListItem(navigator: *) {

    return (item: List) => (<GTouchable
        onPress={() => {
            navigator.showModal({
                screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: item.id,
                },
            });
        }}>
        <LineupCell lineup={item}/>
    </GTouchable>)
}
