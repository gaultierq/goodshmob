// @flow

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import FriendCell from "./components/FriendCell";
import {MainBackground} from "./UIComponents";
import build from 'redux-object'
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed"
import ApiAction from "../utils/ApiAction";


class CommunityScreen extends Component {

    constructor(){
        super();
    }


    render() {
        let friend = this.props.friend;

        let friends = (friend.list || []).map(object => build(this.props.data, object.type, object.id));

        return (
            <MainBackground>
                <View style={styles.container}>
                    <Feed
                        data={friends}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory: () => actions.fetchFriendsCall(this.props.auth.currentUserId),
                            action: actionTypes.LOAD_FRIENDS
                        }}
                        hasMore={!this.props.friend.hasNoMore}
                    />
                </View>
            </MainBackground>
        );
    }


    renderItem(item) {
        let it = item.item;
        return <FriendCell
            onPressItem={() => this.navToFriendDetail(it)}
            friend={it}
        />
    }

    navToFriendDetail(it) {
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});

const mapStateToProps = (state, ownProps) => ({
    friend: state.friend,
    data: state.data,
    app: state.app,
    auth: state.auth,
    request: state.request
});


const actionTypes = (() => {

    const LOAD_FRIENDS = new ApiAction("load_friends");

    return {LOAD_FRIENDS};
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
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        return Api.reduceList(state, action, {fetchFirst: actionTypes.LOAD_FRIENDS});
    }
})();

let screen = connect(mapStateToProps)(CommunityScreen);

export {reducer, screen};
