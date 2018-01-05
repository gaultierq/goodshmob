// @flow

import type {Node} from 'react';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import FriendCell from "../components/FriendCell";
import * as Api from "../../managers/Api";
import Feed from "../components/feed"
import ApiAction from "../../helpers/ApiAction";
import type {Id, Item, User} from "../../types";
import {buildData} from "../../helpers/DataUtils";
import Screen from "../components/Screen";
import GTouchable from "../GTouchable";
import {fullName} from "../../helpers/StringUtils";
import * as Nav from "../Nav";

type Props = {
    userId: Id,
    navigator:any,
    renderItem:?(item:Item)=>Node,

    onPressItem:? (item: User)=>void,
    data?: any,
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@connect(mapStateToProps)
export default class FriendsScreen extends Screen<Props, State> {

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
            renderItem={({item}) => (renderItem||this.renderItem.bind(this))(item)}
            fetchSrc={{
                callFactory,
                action
            }}
            // cannotFetch={!super.isVisible()}
        />);
    }



    renderItem(item: Item) : Node {
        let user = buildData(this.props.data, "users", item.id);
        return (
            <GTouchable onPress={()=> {

                // this.props.navigator.showModal({
                //     screen: 'goodsh.UserSheetScreen', // unique ID registered with Navigation.registerScreen
                //     animationType: 'none',
                //     passProps: {
                //         userId: user.id,
                //     },
                // });

                this.props.navigator.showModal({
                    screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
                    title: fullName(user),
                    passProps: {
                        userId: user.id,
                    },
                    navigatorButtons: {
                        leftButtons: [
                            {
                                id: Nav.CLOSE_MODAL,
                                title: "#Cancel"
                            }
                        ],
                    },
                });


            }}>
                <FriendCell friend={user}/>
            </GTouchable>
        )
    }
}

const actionTypes = (() => {

    const LOAD_FRIENDS = ApiAction.create("load_friends");
    const GET_USER_W_FRIENDS = ApiAction.create("get_user_w_friends");

    return {LOAD_FRIENDS, GET_USER: GET_USER_W_FRIENDS};
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
