// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import type {Activity, ActivityType, Comment, Id} from "../types";
import ApiAction from "../utils/ApiAction";
import {buildData, doDataMergeInState, sanitizeActivityType} from "../utils/DataUtils";
import UserActivity from "../activity/components/UserActivity";
import FeedSeparator from "../activity/components/FeedSeparator";
import * as UI from "./UIStyles";
import {fetchActivity} from "../activity/actions";
import SmartInput from "./components/SmartInput";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


type Props = {
    activityId: Id,
    activityType: ActivityType,
};

type State = {
    newComment?: string,
    isAddingComment?: boolean,
    isFetchingActivity?: boolean
};

class CommentsScreen extends Component<Props, State> {

    state = {};


    componentDidMount() {
        this.load();
    }

    load() {
        if (this.state.isFetchingActivity) return;
        this.setState({isFetchingActivity: true});
        this.props.dispatch(fetchActivity(this.props.activityId, this.props.activityType, {include: "comments"}))
            .catch((err)=>console.log(err))
            .then(this.setState({isFetchingActivity: false}))
    }

    render() {
        let activity = this.getActivity();
        let comments = activity ? activity.comments : [];

        return (
            <MainBackground>
                <KeyboardAwareScrollView
                    // style={{ backgroundColor: '#4c69a5' }}
                    // resetScrollToCoords={{ x: 0, y: 0 }}
                    contentContainerStyle={styles.container}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps={true}
                >
                    {/*<View style={[styles.container]}>*/}

                    {activity &&
                    <View style={{padding: 12, backgroundColor:"transparent"}}>
                        <UserActivity
                            activityTime={activity.createdAt}
                            user={activity.user}
                            navigator={this.props.navigator}
                        />

                        <Text>{activity.description}</Text>
                    </View>}
                    {activity &&
                    <Feed
                        style={[{marginBottom: 50, }]}
                        //ListHeaderComponent={<View style={{height: 50}}/>}
                        inverted
                        data={comments}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory:()=>actions.loadComments(activity),
                            action:actionTypes.LOAD_COMMENTS,
                            options: {activityId: activity.id, activityType: activity.type}
                        }}
                        //hasMore={false}
                        ItemSeparatorComponent={()=> <FeedSeparator/>}
                    />}

                    {
                        activity && <SmartInput
                            containerStyle={{padding: 6, backgroundColor: UI.Colors.grey4}}
                            inputContainerStyle={{borderRadius: 4, borderWidth: 0}}
                            execAction={(input: string) => this.addComment2(activity, input)}
                            placeholder={"activity_comments_screen.add_comment_placeholder"}
                            // multiline
                        />
                    }
                    {/*</View>*/}
                </KeyboardAwareScrollView>
            </MainBackground>
        );
    }

    getActivity() {
        return buildData(this.props.data, this.props.activityType, this.props.activityId);
    }

    // addComment(activity: Activity) {
    //     if (this.state.isAddingComment) return;
    //     this.setState({isAddingComment: true});
    //     this.props.dispatch(actions.addComment(activity, this.state.newComment))
    //         .then(()=>{
    //             this.setState({newComment: '', isAddingComment: false});
    //         });
    //
    // }

    addComment2(activity: Activity, newComment: string) {
        return this.props.dispatch(actions.addComment(activity, newComment))
            .then(()=> {

            },(e)=> {throw e});
    }

    renderItem({item}) {
        let comment : Comment = buildData(this.props.data, "comments", item.id);
        if (!comment) return null;

        return (
            <View style={{padding: 12, }}>
                <UserActivity
                    activityTime={comment.createdAt}
                    user={comment.user}
                    navigator={this.props.navigator}
                />

                <Text>{comment.content}</Text>
            </View>
        );
    }
}


const mapStateToProps = (state, ownProps) => ({
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
                .disptachForAction2(actionTypes.ADD_COMMENT, {activityId: activity.id, activityType: activity.type})
                ;
        }
    };
})();



const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case actionTypes.LOAD_COMMENTS.success(): {
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;

                state = doDataMergeInState(state, path, action.payload.data);
                break;
            }
            case actionTypes.ADD_COMMENT.success(): {

                let {id, type} = action.payload.data;
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;
                state = doDataMergeInState(state, path, [{id, type}], {reverse: true});
                break;
            }

        }
        //let desc = {fetchFirst: actionTypes.LOAD_COMMENTS};
        //return Api.reduceList(state, action, desc);
        return state;
    }
})();

let screen = connect(mapStateToProps)(CommentsScreen);

export {reducer, screen, actions};

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: 'transparent'
    },
    input:{
        height: 40,
    },
    inputContainer:{
        // height: 40,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 14,
        margin: 10,
        marginTop: 0,
        backgroundColor: 'white'
    },
});

