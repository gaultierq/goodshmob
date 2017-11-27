// @flow

import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import type {Node} from 'react';
import {connect} from "react-redux";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "./UIComponents";
import * as Api from "../utils/Api";
import Feed from "./components/feed"
import ApiAction from "../utils/ApiAction";
import type {Id, Item, User} from "../types";
import {buildData} from "../utils/DataUtils";
import * as Nav from "./Nav";

type Props = {
    userId: Id,
    navigator:any,
    renderItem:(item:Item)=>Node,

    onPressItem:? (item: User)=>void,
    data?: any,
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@connect(mapStateToProps)
export default class FriendsScreen extends Component<Props, State> {


    constructor(props){
        super(props);
        props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }


    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            if (event.id === Nav.CANCEL) {
                this.props.navigator.dismissModal();
            }
        }
    }

    render() {

        const {
            userId,
            renderItem,
            ...attributes
        } = this.props;

        let user: User = buildData(this.props.data, "users", userId);

        let friends, callFactory, action;
        if (user && user.friends) {
            friends = user.friends;
            callFactory = () => actions.fetchFriendsCall(userId);
            action = actionTypes.LOAD_FRIENDS;
        }
        else {
            friends = [];
            callFactory = () => actions.getUser(userId);
            action = actionTypes.GET_USER;
        }

        return (<Feed
            {...attributes}
            data={friends}
            renderItem={({item}) => renderItem(item)}
            fetchSrc={{
                callFactory,
                action
            }}
        />);
    }


    renderItem({item} : {item: Item}) {
        const {onPressItem} = this.props;
        return (
            <TouchableOpacity
                onPress={onPressItem}>
                <FriendCell
                    friend={item}
                    onPressItem={this.props.onPressItem}
                />
            </TouchableOpacity>
        )
    }
}



const actionTypes = (() => {

    const LOAD_FRIENDS = new ApiAction("load_friends");
    const GET_USER = new ApiAction("get_user");

    return {LOAD_FRIENDS, GET_USER};
})();


const actions = (() => {
    return {
        fetchFriendsCall: (userId: string) => {

            return new Api.Call().withMethod('GET')
                .withRoute(`users/${userId}/friends`)
                .addQuery({
                    include: "creator"
                });
        },
        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "friends"
                }
            ),
    };
})();



const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
