// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import type {Activity, Comment} from "../types";
import ApiAction from "../utils/ApiAction";
import {buildNonNullData, sanitizeActivityType} from "../utils/DataUtils";
import UserActivity from "../activity/components/UserActivity";

class CommentsScreen extends Component {

    props : {
        activity: Activity,
    };

    render() {

        return (
            <MainBackground>
                <View style={styles.container}>
                    <Feed
                        data={this.props.comments.list}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory:()=>actions.loadComments(this.props.activity),
                            action:actionTypes.LOAD_COMMENTS
                        }}
                        hasMore={false}
                        ListHeaderComponent={
                            <View style={{padding: 12, backgroundColor:"transparent"}}>
                                <UserActivity
                                    activityTime={this.props.activity.createdAt}
                                    user={this.props.activity.user}/>

                                <Text>{this.props.activity.description}</Text>
                            </View>
                        }
                    />

                </View>
            </MainBackground>
        );
    }

    renderItem(item) {
        let comment : Comment = item.item;
        comment = buildNonNullData(this.props.data, "comments", comment.id);
        return (
            <View style={{padding: 12, backgroundColor:"white"}}>
                <UserActivity
                    activityTime={comment.createdAt}
                    user={comment.user}/>

                <Text>{comment.content}</Text>
            </View>
        );
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    }
});

const mapStateToProps = (state, ownProps) => ({
    comments: state.comments,
    data: state.data,
});


const actionTypes = (() => {

    const LOAD_COMMENTS = new ApiAction("load_comments");

    return {LOAD_COMMENTS};
})();


const actions = (() => {
    return {

        loadComments: (activity: Activity) => {

            let activityType = sanitizeActivityType(activity.type);

            return new Api.Call()
                .withMethod('GET')
                .withRoute(`${activityType}/${activity.id}/comments`);
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_COMMENTS};
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(CommentsScreen);

export {reducer, screen, actions};
