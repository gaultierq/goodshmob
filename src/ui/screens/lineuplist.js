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
import {currentUserId, logged} from "../../managers/CurrentUser"
import LineupCell from "../components/LineupCell";
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import {SearchBar} from 'react-native-elements'
import type {Id, List, User} from "../../types";
import type {Props as FeedProps} from "../components/feed";
import Feed from "../components/feed";
import ApiAction from "../../helpers/ApiAction";
import {buildData, doDataMergeInState} from "../../helpers/DataUtils";
import {CREATE_LINEUP, DELETE_LINEUP} from "../lineup/actionTypes";
import {mergeItemsAndPendings} from "../../helpers/ModelUtils";
import {STYLES} from "../UIStyles";
import GTouchable from "../GTouchable";
import Screen from "../components/Screen";
import dotprop from "dot-prop-immutable"
import * as Nav from "../Nav"

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
            callFactory: () => actions.fetchLineups(userId),
            action: FETCH_LINEUPS,
            options: {userId}
        } : {
            callFactory: () => actions.getUserAndTheirLists(userId),
            action: GET_USER_W_LISTS
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
            <Feed
                data={items}
                listRef={this.props.listRef}
                sections={sectionMaker && sectionMaker(items)}
                renderItem={this.renderItem.bind(this)}
                fetchSrc={fetchSrc}
                navigator={this.props.navigator}
                {...attributes}
            />
        );
    }

    renderItem(item) {
        let list = item.item;
        if (!(list.type === 'lists')) throw "unexpected type";

        list = buildData(this.props.data, list.type, list.id) || list;

        let {renderItem, navigator} = this.props;

        return (renderItem || renderSimpleListItem(navigator))(list);
    }

}


const GET_USER_W_LISTS = ApiAction.create("get_user_w_lists", "get user lists of lineups");
const FETCH_LINEUPS = ApiAction.create("fetch_lineups", "retrieve the user lineups details");

const actions = (() => {

    return {
        fetchLineups: userId => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}/lists`)
            .addQuery({include: "savings,savings.resource"}),

        getUserAndTheirLists: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({include: "lists,lists.savings,lists.savings.resource"}),

    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    let getPath = userId => `users.${userId}.relationships.lists.data`;

    return (state = initialState, action = {}) => {
        switch (action.type) {
            case FETCH_LINEUPS.success(): {
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
