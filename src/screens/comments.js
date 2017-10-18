// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import type {Activity, Comment} from "../types";
import ApiAction from "../utils/ApiAction";
import {buildNonNullData, sanitizeActivityType} from "../utils/DataUtils";
import UserActivity from "../activity/components/UserActivity";
import {TP_MARGINS} from "./UIStyles";
import i18n from '../i18n/i18n'

class CommentsScreen extends Component {

    props : {
        activity: Activity,
    };

    state = {
        newComment: '',
        isAddingComment: false
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
                    <TextInput
                        editable={!this.state.isAddingComment}
                        style={styles.input}
                        onSubmitEditing={this.addComment.bind(this)}
                        value={this.state.newComment}
                        onChangeText={newComment => this.setState({newComment})}
                        placeholder={i18n.t("activity_comments_screen.add_comment_placeholder")}
                    />

                </View>
            </MainBackground>
        );
    }

    addComment() {
        if (this.state.isAddingComment) return;
        this.setState({isAddingComment: true});
        this.props.dispatch(actions.addComment(this.props.activity, this.state.newComment))
            .then(()=>{
                this.setState({newComment: '', isAddingComment: false});
            });

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
    },
    input:{...TP_MARGINS(20), height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}
});

const mapStateToProps = (state, ownProps) => ({
    comments: state.comments,
    data: state.data,
});


const actionTypes = (() => {

    const LOAD_COMMENTS = new ApiAction("load_comments");
    const ADD_COMMENT = new ApiAction("add_comment");

    return {LOAD_COMMENTS, ADD_COMMENT};
})();


const actions = (() => {
    return {

        loadComments: (activity: Activity) => {

            let activityType = sanitizeActivityType(activity.type);

            return new Api.Call()
                .withMethod('GET')
                .withRoute(`${activityType}/${activity.id}/comments`);
        },

        addComment: (activity: Activity, content: string) => {
            let activityType = sanitizeActivityType(activity.type);
            return new Api.Call()
                .withMethod('POST')
                .withRoute(`${activityType}/${activity.id}/comments`)
                .addQuery({include: "user"})
                .withBody({comment: {content: content}})
                .disptachForAction2(actionTypes.ADD_COMMENT)
                ;
        }
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        let desc = {fetchFirst: actionTypes.LOAD_COMMENTS};
        switch (action.type) {
            case actionTypes.ADD_COMMENT.success():
                let payload = action.payload;
                let {id, type} = payload.data;
                let newItem = {id, type};

                let list = Immutable([newItem]).concat(state.list);
                state = state.merge({list});
                break;
        }
        return Api.reduceList(state, action, desc);
    }
})();

let screen = connect(mapStateToProps)(CommentsScreen);

export {reducer, screen, actions};
