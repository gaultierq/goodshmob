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
                        fetchAction={() => actions.loadSavings(this.props.auth.currentUserId)}
                        fetchMoreAction={actions.loadMoreSavings}
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

    const LOAD_FRIENDS = new Api.ApiAction("load_friends");
    const LOAD_MORE_FRIENDS = new Api.ApiAction("load_more_friends");

    return {LOAD_SAVINGS: LOAD_FRIENDS, LOAD_MORE_FRIENDS};
})();


const actions = (() => {
    return {

        loadSavings: (userId: string) => {

            let call = new Api.Call().withMethod('GET')
                .withRoute(`users/${userId}/friends`)
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actionTypes.LOAD_SAVINGS);
        },
        loadMoreSavings: (nextUrl:string) => {
            let call = new Api.Call.parse(nextUrl).withMethod('GET')
                .withQuery({
                    page: 1,
                    per_page: 10,
                    include: "creator"
                });

            return call.disptachForAction(actionTypes.LOAD_MORE_FRIENDS);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_SAVINGS, fetchMore: actionTypes.LOAD_MORE_FRIENDS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(CommunityScreen);

export {reducer, screen};
