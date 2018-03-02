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

export type Props = FeedProps<List> & {
    userId: Id,
    data?: any,
    onCancel?: ()=>void,
    sectionMaker?: (lineups: List<List>) => Array<*>,
    ListHeaderComponent?: Node,
    renderItem: (item: *)=>Node,
    navigator: *
};

type State = {
    isLoading?: boolean,
    isLoadingMore?: boolean,
};



@logged
@connect((state, ownProps) => ({
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
        let lists, sections, fetchSrc;
        if (user && user.lists) {
            lists = user.lists;
            fetchSrc = userId === currentUserId() ? {
                callFactory: actions.fetchLineups,
                action: FETCH_LINEUPS,
                options: {userId}
            } : null;
        }
        else {
            lists = [];
            fetchSrc = {
                callFactory: () => actions.getUser(userId),
                action: GET_USER_W_LISTS
            };
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
                type: 'lists' //here ? or reducer ?
            }),
            {afterI: 0}
        );

        if (sectionMaker) sections = sectionMaker(items);


        return (
            <Feed
                data={items}
                sections={sections}
                renderItem={this.renderItem.bind(this)}
                fetchSrc={fetchSrc}
                {...attributes}
            />
        );
    }



    renderItem({item}) {

        if (!(item.type === 'lists')) throw "unexpected type";

        item = buildData(this.props.data, item.type, item.id) || item;

        let {renderItem, navigator} = this.props;

        return (renderItem || renderSimpleListItem(navigator))(item);
    }

}


const GET_USER_W_LISTS = ApiAction.create("get_user_w_lists");
const FETCH_LINEUPS = ApiAction.create("fetch_lineups");

const actions = (() => {

    return {
        fetchLineups: () => new Api.Call()
            .withMethod('GET')
            .withRoute("lists")
            // .delay(5000)
            .addQuery({include: "savings,savings.resource"}),

        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({include: "lists,lists.savings,lists.savings.resource"}),

    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        switch (action.type) {
            case FETCH_LINEUPS.success(): {
                let {userId} = action.options;
                let path = `users.${userId}.relationships.lists.data`;
                state = doDataMergeInState(state, path, action.payload.data);
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
            navigator.push({
                screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: item.id,
                },
            });
        }}>
        <LineupCell lineup={item}/>
    </GTouchable>)
}
