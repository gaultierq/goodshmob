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
import Feed from "./components/feed";
import {currentUserId} from "../CurrentUser"
import ApiAction from "../utils/ApiAction";
import {buildData, doDataMergeInState} from "../utils/DataUtils";
import {CREATE_LINEUP, SAVE_ITEM} from "./actions"
import * as Nav from "./Nav";
import * as _ from "lodash";
import dotprop from "dot-prop-immutable"

export const DELETE_LINEUP = new ApiAction("delete_lineup");
export const EDIT_LINEUP = new ApiAction("edit_lineup");

export type LineupProps = {
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


class LineupListScreen extends Component<LineupProps, State> {

    state = {
        isLoading: false,
        isLoadingMore: false,
    };


    constructor(props){
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            if (event.id === Nav.CANCEL) {
                this.props.onCancel();
            }
        }
    }

    render() {
        const {userId/*, filter*/} = this.props;

        let user: User = buildData(this.props.data, "users", userId);

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

        let data: Array<types.List|types.Item> = lists;

        return (
            <View>
                <Feed
                    data={data}
                    renderItem={this.renderItem.bind(this)}
                    fetchSrc={fetchSrc}
                    ListHeaderComponent={this.props.ListHeaderComponent}
                />
            </View>
        );
    }


    renderItem({item}) {

        if (!(item.type === 'lists')) throw "unexpected";

        item = buildData(this.props.data, item.type, item.id) || item;

        let {renderItem, navigator} = this.props;

        return (renderItem || renderSimpleListItem(navigator))(item);
    }

}



const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

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


            //FIXME: this does not belong here !
            case CREATE_LINEUP.success(): {
                let userId = currentUserId();
                let {id, type} = action.payload.data;
                let path = `users.${userId}.relationships.lists.data`;
                let goodshboxId = _.get(state, `users.${userId}.relationships.goodshbox.data.id`, null);
                state = doDataMergeInState(state, path, [{id, type}], {afterId: goodshboxId});

                //state = state.merge({list});
                break;
            }

            //FIXME: this does not belong here !
            case DELETE_LINEUP.success(): {
                let userId = currentUserId();
                let {lineupId} = action.options;
                let path = `users.${userId}.relationships.lists.data`;
                let lists = _.get(state, path, null);
                lists = _.filter(lists, (l) => l.id !== lineupId);
                state = dotprop.set(state, path, lists);
                break;
            }

            //FIXME: this does not belong here !
            case SAVE_ITEM.success(): {
                let {id, type} = action.payload.data;
                let {lineupId} = action.options;
                let path = `lists.${lineupId}.relationships.savings.data`;
                let savings = _.get(state, path, null);
                if (savings) {
                    savings = savings.slice();
                    savings.splice(0, 0, {id, type})
                    state = dotprop.set(state, path, savings);
                }
                break;
            }
        }

        return state;
    }
})();


// let path = `${activityType}.${activityId}.relationships.comments.data`;
// state = doDataMergeInState(state, path, [{id, type}], {reverse: true});
// break;

let screen = connect(mapStateToProps)(LineupListScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'transparent',
    },
    searchInput: {
        backgroundColor: 'white',
        borderWidth: 0.5,
        // borderRadius: 30,
        // padding: 20,
        borderColor: UI.Colors.grey1
    },

});

export {reducer, screen};

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