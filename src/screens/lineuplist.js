// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
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
    TouchableWithoutFeedback,
    View
} from 'react-native';

import {connect} from "react-redux";
import LineupCell from "./components/LineupCell";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import * as UI from "../screens/UIStyles";
import {SearchBar} from 'react-native-elements'
import type types, {Id, List, User} from "../types";
import type {FeedProps} from "./components/feed";
import Feed from "./components/feed";
import {currentUserId} from "../CurrentUser"
import ApiAction from "../utils/ApiAction";
import {buildData, doDataMergeInState} from "../utils/DataUtils";
import * as Nav from "./Nav";

export const DELETE_LINEUP = new ApiAction("delete_lineup");
export const EDIT_LINEUP = new ApiAction("edit_lineup");

export type Props = FeedProps & {
    userId: Id,
    onSavingPressed: Function,
    canFilterOverItems: boolean | ()=>boolean,
    // filter:? string,
    data?: any,
    onCancel?: ()=>void,
    ListHeaderComponent?: Node,
    renderItem: (item: *)=>Node,
    navigator: *
};

type State = {
    isLoading?: boolean,
    isLoadingMore?: boolean,
};



@connect((state, ownProps) => ({
    data: state.data,
}))
export class LineupListScreen extends Component<Props, State> {

    state = {
        isLoading: false,
        isLoadingMore: false,
    };

    render() {
        const {
            userId,
            onSavingPressed,
            canFilterOverItems,
            data,
            onCancel,
            renderItem,
            navigator,
            //ListHeaderComponent,
            ...attributes
        } = this.props;

        let user: User = buildData(this.props.data, "users", userId);
        console.log("Feed attributes: scrollUpOnBack="+attributes.scrollUpOnBack);
        let lists, fetchSrc;
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

        let items: Array<types.List|types.Item> = lists;

        return (
            <Feed
                data={items}
                renderItem={this.renderItem.bind(this)}
                fetchSrc={fetchSrc}
                {...attributes}
            />
        );
    }

    renderItem({item}) {

        if (!(item.type === 'lists')) throw "unexpected";

        item = buildData(this.props.data, item.type, item.id) || item;

        let {renderItem, navigator} = this.props;

        return (renderItem || renderSimpleListItem(navigator))(item);
    }

}


const GET_USER_W_LISTS = new ApiAction("get_user");
const FETCH_LINEUPS = new ApiAction("fetch_lineups");

const actions = (() => {

    return {
        fetchLineups: () => new Api.Call()
            .withMethod('GET')
            .withRoute("lists")
            .addQuery({include: "savings,savings.resource"})
        ,

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


// let path = `${activityType}.${activityId}.relationships.comments.data`;
// state = doDataMergeInState(state, path, [{id, type}], {reverse: true});
// break;

//let screen = connect(mapStateToProps)(LineupListScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: 'white',
        borderWidth: StyleSheet.hairlineWidth,
        // borderRadius: 30,
        // padding: 20,
        borderColor: UI.Colors.grey1
    },

});

export {reducer};

export function renderSimpleListItem(navigator: *) {

    return (item: List) => (<TouchableWithoutFeedback
        onPress={() => {
            navigator.push({
                screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
                passProps: {
                    lineupId: item.id,
                },
            });
        }}>
        <LineupCell lineup={item}/>
    </TouchableWithoutFeedback>)
}