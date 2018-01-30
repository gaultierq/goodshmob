// @flow
import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {currentUser, logged} from "../../managers/CurrentUser"
import {MainBackground} from "../UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import Feed from "../components/feed";
import type {Activity, ActivityType, Comment, Id} from "../../types";
import ApiAction from "../../helpers/ApiAction";
import {buildData, doDataMergeInState, sanitizeActivityType} from "../../helpers/DataUtils";
import UserActivity from "../activity/components/UserActivity";
import FeedSeparator from "../activity/components/FeedSeparator";
import {fetchActivity} from "../activity/actions";
import SmartInput from "../components/SmartInput";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import type {PendingAction} from "../../helpers/ModelUtils";
import {mergeItemsAndPendings, pendingActionWrapper} from "../../helpers/ModelUtils";
import {Colors} from "../colors";
import Screen from "../components/Screen";
import {STYLES} from "../UIStyles";


const LOAD_COMMENTS = ApiAction.create("load_comments");
export const CREATE_COMMENT = ApiAction.create("create_comment");

type Props = {
    activityId: Id,
    activityType: ActivityType,
    pending: any,
    autofocus?:?boolean
};

type State = {
    newComment?: string,
    isAddingComment?: boolean,
    isFetchingActivity?: boolean
};

@logged
@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
class CommentsScreen extends Screen<Props, State> {

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

    // render() {
    //     let activity = this.getActivity();
    //     let comments = activity ? activity.comments : [];
    //
    //     let items = mergeItemsAndPendings(
    //         comments,
    //         this.props.pending[CREATE_COMMENT],
    //         [],
    //         (pending) => ({
    //             id: pending.id,
    //             name: pending.payload.listName,
    //             content: pending.payload.content,
    //             createdAt: pending.insertedAt,
    //             user: currentUser(),
    //             type: 'comments',
    //             pending: true
    //         })
    //     );
    //
    //     return (
    //
    //         <View style={{flex:1}}>
    //             {activity &&
    //             <View style={{ padding: 12, backgroundColor: Colors.white82 }}>
    //                 <UserActivity
    //                     activityTime={activity.createdAt}
    //                     user={activity.user}
    //                     navigator={this.props.navigator}
    //                 />
    //                 <Text style={styles.comment}>{activity.description}</Text>
    //             </View>}
    //
    //
    //             {activity &&
    //             <KeyboardAwareScrollView
    //                 // style={{ backgroundColor: '#4c69a5' }}
    //                 // resetScrollToCoords={{ x: 0, y: 0 }}
    //                 // contentContainerStyle={styles.container}
    //                 scrollEnabled={false}
    //                 keyboardShouldPersistTaps={true}
    //             >
    //                 <View style={{flex:1, justifyContent: 'flex-end'}}>
    //                     <Feed
    //                         inverted
    //                         data={items}
    //                         renderItem={this.renderItem.bind(this)}
    //                         fetchSrc={{
    //                             callFactory:()=>actions.loadComments(activity),
    //                             action: LOAD_COMMENTS,
    //                             options: {activityId: activity.id, activityType: activity.type}
    //                         }}
    //                         //hasMore={false}
    //                         //ItemSeparatorComponent={()=> <FeedSeparator/>}
    //                     />
    //
    //                     <SmartInput
    //                         containerStyle={{position: 'absolute', bottom: 0, padding: 6, paddingBottom: 10}}
    //                         inputContainerStyle={{borderRadius: 4, borderWidth: 0}}
    //                         execAction={(input: string) => this.addComment3(activity, input)}
    //                         placeholder={"activity_comments_screen.add_comment_placeholder"}
    //                         returnKeyType={'send'}
    //                         autoFocus={this.props.autofocus}
    //                     />
    //                 </View>
    //             </KeyboardAwareScrollView>
    //             }
    //         </View>
    //
    //
    //
    //
    //     );
    // }

    render() {
        let activity = this.getActivity();
        let comments = activity ? activity.comments : [];

        let items = mergeItemsAndPendings(
            comments,
            this.props.pending[CREATE_COMMENT],
            [],
            (pending) => ({
                id: pending.id,
                name: pending.payload.listName,
                content: pending.payload.content,
                createdAt: pending.insertedAt,
                user: currentUser(),
                type: 'comments',
                pending: true
            })
        );
        return (
            <MainBackground>

                {activity && <View style={
                    {
                        position: 'absolute',
                        width: '100%',
                        top: 0,
                        padding: 12,
                        backgroundColor:Colors.white,
                        shadowOffset: {width: 0, height: 4},
                        shadowColor: Colors.black,
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 1,
                        zIndex: 10,
                    }
                }>
                    <View>
                        <UserActivity
                            activityTime={activity.createdAt}
                            user={activity.user}
                            navigator={this.props.navigator}
                        />
                    </View>

                    <Text>{activity.description}</Text>
                </View>}
                {activity && <KeyboardAwareScrollView
                    // style={{ backgroundColor: '#4c69a5' }}
                    // resetScrollToCoords={{ x: 0, y: 0 }}
                    contentContainerStyle={styles.container}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps={true}
                >

                    <View style={{flex:1, justifyContent: 'flex-end'}}>

                        <Feed
                            inverted
                            data={items}
                            renderItem={this.renderItem.bind(this)}
                            fetchSrc={{
                                callFactory:()=>actions.loadComments(activity),
                                action: LOAD_COMMENTS,
                                options: {activityId: activity.id, activityType: activity.type}
                            }}
                            ItemSeparatorComponent={()=> <FeedSeparator/>}
                            contentContainerStyle={{
                                marginBottom: 4, paddingTop: 40,
                                paddingBottom: 75,
                                backgroundColor: Colors.greying}}
                            empty={<Text style={[STYLES.empty_message, {fontSize: 16, paddingBottom: 50}]}>{i18n.t('common.empty_feed_generic')}</Text>}
                        />

                        <SmartInput
                            containerStyle={{position: 'absolute', bottom: 0, padding: 3, backgroundColor: Colors.greying}}
                            inputContainerStyle={{borderRadius: 4, borderWidth: 0}}
                            execAction={(input: string) => this.addComment3(activity, input)}
                            placeholder={"activity_comments_screen.add_comment_placeholder"}
                            returnKeyType={'send'}
                            // multiline
                        />

                    </View>
                </KeyboardAwareScrollView>}
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

    // addComment2(activity: Activity, newComment: string) {
    //     return this.props.dispatch(actions.addComment(activity, newComment))
    //         .then(()=> {
    //
    //         },(e)=> {throw e});
    // }


    addComment3(activity: Activity, newComment: string) {
        let delayMs = 3000;
        let activityId = activity.id;
        let activityType = sanitizeActivityType(activity.type);
        let content = newComment;

        let payload = {activityId, activityType, content};
        let options = {delayMs, activityId, activityType};

        return this.props.dispatch(COMMENT_CREATION.pending(payload, options))
    }

    renderItem({item}) {

        let comment : Comment = item.pending ? item : buildData(this.props.data, "comments", item.id);

        if (!comment) return null;

        return (
            <View style={{padding: 12, paddingTop: 0, paddingBottom: 15, backgroundColor: Colors.white, }}>
                <UserActivity
                    activityTime={comment.createdAt}
                    user={comment.user}
                    navigator={this.props.navigator}
                    style={{marginTop:12}}
                />
                <Text style={styles.comment}>{comment.content}</Text>
            </View>
        );
    }
}



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
            let activityId = activity.id;

            return new Call()
                .withMethod('POST')
                .withRoute(`${activityType}/${activityId}/comments`)
                .addQuery({include: "user"})
                .withBody({comment: {content: content}})
                .disptachForAction2(CREATE_COMMENT, {activityId, activityType})
                ;
        }
    };
})();




type COMMENT_CREATION_PAYLOAD = {activityType: ActivityType, activityId: Id, content: string}

export const COMMENT_CREATION: PendingAction<COMMENT_CREATION_PAYLOAD>  = pendingActionWrapper(
    CREATE_COMMENT,
    ({activityType, activityId, content}: COMMENT_CREATION_PAYLOAD) => new Call()
        .withMethod('POST')
        .withRoute(`${activityType}/${activityId}/comments`)
        .addQuery({include: "user"})
        .withBody({comment: {content}})
);

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case LOAD_COMMENTS.success(): {
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;

                state = doDataMergeInState(state, path, action.payload.data);
                break;
            }
            case CREATE_COMMENT.success(): {

                let {id, type} = action.payload.data;
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;
                state = doDataMergeInState(state, path, [{id, type}], {reverse: true});
                break;
            }

        }
        //let desc = {fetchFirst: LOAD_COMMENTS};
        //return Api.reduceList(state, action, desc);
        return state;
    }
})();

let screen = CommentsScreen;

export {reducer, screen, actions};

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: Colors.greying
    },
    input:{
        height: 40,
    },
    inputContainer:{
        // height: 40,
        borderColor: Colors.greyishBrown,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 14,
        margin: 10,
        marginTop: 0,
        backgroundColor: Colors.white
    },
    comment: {
        marginLeft: 38,
        marginTop: -4,
        color: Colors.brownishGrey
    }
});
