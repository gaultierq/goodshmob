// @flow
import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {currentUser, isCurrentUser, logged} from "../../managers/CurrentUser"
import {MainBackground, TRANSPARENT_SPACER} from "../UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import Feed from "../components/feed";
import type {Activity, ActivityType, Comment, Id} from "../../types";
import ApiAction from "../../helpers/ApiAction";
import {buildData, doDataMergeInState, sanitizeActivityType} from "../../helpers/DataUtils";
import {fetchActivity} from "../activity/actions";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import type {PendingAction} from "../../helpers/ModelUtils";
import {mergeItemsAndPendings, pendingActionWrapper} from "../../helpers/ModelUtils";
import {Colors} from "../colors";
import Screen from "../components/Screen";
import {component as CommentInput} from "../components/CommentInput"
import {styleMargin, STYLES} from "../UIStyles";
import ActivityStatus from "../activity/components/ActivityStatus";
import CommentCell from "../components/CommentCell";
import MultiMap from "multimap";


const LOAD_COMMENTS = ApiAction.create("load_comments");
export const CREATE_COMMENT = ApiAction.create("create_comment");

type Props = {
    activityId: Id,
    activityType: ActivityType,
    pending: any,
    autoFocus?:?boolean
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

    //use Api.safeDispatchAction
    load() {
        if (this.state.isFetchingActivity) return;
        this.setState({isFetchingActivity: true});
        this.props.dispatch(fetchActivity(this.props.activityId, this.props.activityType, {include: "comments"}))
            .catch((err)=>console.log(err))
            .then(this.setState({isFetchingActivity: false}))
    }


    render() {
        let activity = this.getActivity();

        let comments = mergeItemsAndPendings(
            activity ? activity.comments : [],
            this.props.pending[CREATE_COMMENT],
            [],
            (pending) => ({
                id: pending.id,
                name: pending.payload.listName,
                content: pending.payload.content,
                createdAt: Date(pending.insertedAt),
                user: currentUser(),
                type: 'comments',
                pending: true
            })
        );

        const fullComments = comments.filter( c => c.built || c.pending);

        return (
            <MainBackground>

                {activity && <KeyboardAwareScrollView
                    // style={{ backgroundColor: '#4c69a5' }}
                    // resetScrollToCoords={{ x: 0, y: 0 }}
                    contentContainerStyle={styles.container}
                    extraScrollHeight={20}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='always'
                >

                    <View style={{flex:1, justifyContent: 'flex-end'}}>

                        <Feed
                            style={{flex:1}}
                            inverted
                            ListFooterComponent={this.renderDescription(activity)}
                            sections={this.splitCommentsInSections(fullComments)}
                            keyExtractor={item => _.head(item).id}
                            SectionSeparatorComponent={()=> <View style={{margin: 4}} />}
                            // style={{backgroundColor: 'red'}}
                            renderSectionFooter={({section}) => <Text
                                style={{
                                    // alignItems: 'center',
                                    alignSelf: 'center',
                                    fontSize: 11,
                                    // backgroundColor: 'red',
                                    color: Colors.greyish,
                                }}>
                                {section.title}</Text>}


                            fetchSrc={{
                                callFactory:()=>actions.loadComments(activity),
                                action: LOAD_COMMENTS,
                                options: {activityId: activity.id, activityType: activity.type}
                            }}
                            contentContainerStyle={{
                                marginBottom: 4,
                                paddingTop: 40,
                                paddingBottom: 15,
                                backgroundColor: Colors.greying}}
                            // empty={<Text style={[STYLES.empty_message, {fontSize: 20, paddingBottom: 50}]}>{i18n.t('activity_screen.comments.no_comments')}</Text>}
                        />

                        <CommentInput
                            activity={activity}
                            containerStyle={{position: 'absolute', bottom: 0, padding: 0, backgroundColor: Colors.white}}
                            placeholder={"activity_comments_screen.add_comment_placeholder"}
                            autoFocus={this.props.autoFocus}
                        />

                    </View>
                </KeyboardAwareScrollView>}
            </MainBackground>
        );
    }

    renderDescription(activity) {
        return <ActivityStatus
            activity={activity}
            // skipLineup={this.props.skipLineup}
            navigator={this.props.navigator}
            descriptionNumberOfLines={8}
            style={{
                ...styleMargin(0, 0),
            }}
            descriptionContainerStyle={{
                backgroundColor: 'white',
                borderRadius: 6,
                padding: 6,
                paddingHorizontal: 10,
                marginLeft: 36,
                marginRight: 4,
                marginTop: 4,
                marginBottom: 8,
                flex: 0
            }}
            descriptionStyle={{
                flex:0,
            }}
            cardStyle={{
                backgroundColor: 'transparent',
            }}
        />;
    }

    splitCommentsInSections(comments: Array<Comment>) {

        const sectionsMap = new MultiMap();


        comments.forEach(c => {
            //group by day
            let day = i18n.strftime(new Date(c.createdAt), "%d/%m/%Y");
            sectionsMap.set(day, c);
        });


        // [c1, c2, c3] ==> [[c1,c2], [c3]]
        let groupByAuthor = comments => {
            const grouped = [];

            for (let i = 0, lastAuthorId = null, lastAuthorIx = null; i <= comments.length; i++) {
                let current = _.nth(comments,i);
                const authorId = current && current.user.id;


                if (authorId !== lastAuthorId) {
                    //pushing old group
                    if (lastAuthorIx !== null) {
                        let commentsFor1Author = _.slice(comments, lastAuthorIx, i);
                        commentsFor1Author = _.reverse(commentsFor1Author);
                        grouped.push(commentsFor1Author);
                    }

                    //starting new group
                    lastAuthorIx = i;
                    lastAuthorId = authorId;
                }
            }


            return grouped;
        };

        const authorGrouped = new MultiMap();
        // group authors
        sectionsMap.forEachEntry((value, k) => {
            let groupedByAuthor = groupByAuthor(value);
            groupedByAuthor = _.reverse(groupedByAuthor);
            authorGrouped.set(k, ...groupedByAuthor);
        });

        const sections = [];


        authorGrouped.forEachEntry((value, k) => {

            const dateStr = _.nth(_.nth(value, 0), 0).createdAt;
            const date = new Date(dateStr);
            let format = Date.now() - Date.parse(dateStr) < 7 * 24 * 60 * 60 * 1000 ? "%a %-H:%M" :  "%d/%m/%-y %-H:%M";

            const data = _.reverse(value);
            sections.push({
                // data: data,
                data: value,
                title: i18n.strftime(date, format),
                // subtitle: ` (${savingCount})`,
                // onPress: () => this.seeLineup(goodshbox.id),
                renderItem: this.renderItem.bind(this)
            })
        });

        return sections;
    }


    getActivity() {
        return buildData(this.props.data, this.props.activityType, this.props.activityId);
    }

    renderItem({item}) {

        // let comment : Comment = item.pending ? item : buildData(this.props.data, "comments", item.id);
        let comments = (_.isArray(item) && item || [item]).map(c => c.pending ? c : buildData(this.props.data, "comments", c.id));

        //why ?
        if (_.isEmpty(comments)) return null;

        const user = _.head(comments).user;
        return (
            <View style={{padding: 12, paddingTop: 0, paddingBottom: 15, }}>
                <CommentCell
                    comment={comments}
                    user={user}
                    rightDisplay={isCurrentUser(user)}
                    skipTime={true}
                />
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

        }
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
