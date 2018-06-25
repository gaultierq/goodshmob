// @flow
import React from 'react'
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native'
import {connect} from "react-redux"
import {currentUser, isCurrentUser, logged} from "../../managers/CurrentUser"
import {FullScreenLoader, MainBackground} from "../UIComponents"
import Immutable from 'seamless-immutable'
import * as Api from "../../managers/Api"
import {Call} from "../../managers/Api"
import Feed from "../components/feed"
import type {Activity, ActivityType, Comment, Id, RequestState} from "../../types"
import ApiAction from "../../helpers/ApiAction"
import {buildData, doDataMergeInState, sanitizeActivityType} from "../../helpers/DataUtils"
import {fetchActivity} from "../activity/actions"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {mergeItemsAndPendings} from "../../helpers/ModelUtils"
import {Colors} from "../colors"
import Screen from "../components/Screen"
import {component as CommentInput} from "../components/CommentInput"
import ActivityStatus from "../activity/components/ActivityStatus"
import CommentCell from "../components/CommentCell"
import MultiMap from "multimap"
import Http404 from "./errors/404"


const LOAD_COMMENTS = ApiAction.create("load_comments", "retrieve the comments of an item");
export const CREATE_COMMENT = ApiAction.create("create_comment", "add a new comment");

type Props = {
    activityId: Id,
    activityType: ActivityType,
    pending: any,
    autoFocus?:?boolean
};

type State = {
    newComment?: string,
    isAddingComment?: boolean,
    reqFetchActivity?: RequestState
};

@logged
@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
class CommentsScreen extends Screen<Props, State> {

    state = {};


    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            fetchActivity(this.props.activityId, this.props.activityType, {include: "comments"}),
            'reqFetchActivity'
        )
    }

    render() {
        let activity = this.getActivity();

        if (!activity) {
            if (this.state.reqFetchActivity === 'sending') return <FullScreenLoader/>
            if (this.state.reqFetchActivity === 'ko') return <Http404/>
            console.warn('rendering hole')
            return null
        }
        let comments = mergeItemsAndPendings(
            activity ? activity.comments : [],
            _.filter(this.props.pending[CREATE_COMMENT], p => _.get(p, 'payload.activityId') === activity.id),
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

        comments = _.sortBy(comments, c => new Date(c.createdAt))
        comments = _.reverse(comments)

        const fullComments = comments.filter( c => c.built || c.pending);

        this.setNavigatorTitle(this.props.navigator, {
            title: i18n.t('comments_screen.title'),
            subtitle: _.get(activity, 'resource.title')
        })

        let sections = this.splitCommentsInSections(fullComments);
        return (
            <MainBackground>

                {activity && <KeyboardAwareScrollView
                    // style={{ backgroundColor: '#4c69a5' }}
                    // resetScrollToCoords={{ x: 0, y: 0 }}
                    contentContainerStyle={[
                        // styles.container,
                        {
                            flex:1,
                            justifyContent: 'flex-end',
                            // backgroundColor: 'pink',
                        }
                    ]}
                    style={{
                        //    backgroundColor: 'pink',
                    }}
                    // extraScrollHeight={20}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps='always'
                >

                    <View style={{
                        flex:1,
                        justifyContent: 'flex-end',
                        // backgroundColor: 'brown'
                    }}>

                        <Feed
                            decorateLoadMoreCall={(sections: any[], call: Call) => {
                                if (!_.isEmpty(sections)) {
                                    let last = _.head(_.filter(this.toFlat(sections), f => !f.pending))
                                    if (last) {
                                        call.addQuery({id_after: last.id})
                                    }

                                }

                            }}
                            inverted
                            ListFooterComponent={this.renderDescription(activity)}
                            sections={sections}
                            keyExtractor={item => _.head(item).id}
                            getFlatItems={() => this.toFlat(sections)}
                            doNotDisplayFetchMoreLoader={true}
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
                                // paddingTop: 40,
                                paddingVertical: 15,
                                // backgroundColor: Colors.greying
                            }}
                            // ListEmptyComponent={<Text style={[STYLES.empty_message, {fontSize: 20, paddingBottom: 50}]}>{i18n.t('activity_screen.comments.no_comments')}</Text>}
                        />

                        <View style={{height: 60, flex:0, backgroundColor: 'blue'}}>
                            <CommentInput
                                activity={activity}
                                underlineColorAndroid={'transparent'}
                                containerStyle={{
                                    // position: 'absolute',
                                    // bottom: 0,
                                    // padding: 0,
                                    flex: 0,
                                    paddingHorizontal: 8,
                                    backgroundColor: Colors.white,
                                    // backgroundColor: 'orange',
                                }}
                                inputStyle={{
                                    paddingBottom: 0,
                                    marginBottom: 0,
                                }}
                                height={60}
                                placeholder={i18n.t("activity_comments_screen.add_comment_placeholder")}
                                autoFocus={this.props.autoFocus}
                            />
                        </View>

                    </View>
                </KeyboardAwareScrollView>}
            </MainBackground>
        );
    }


    toFlat(sections: any) {
        let concat = datas => Array.prototype.concat.apply([], datas)

        //datas = [date1, date2, date3, date4]
        let datas = sections.map(s => s.data)
        let byDate = concat(datas)
        let byAuthor = concat(byDate)
        let comments = concat(byAuthor)
        return comments

    }

    renderDescription(activity: Activity) {
        return <ActivityStatus
            activity={activity}
            // skipLineup={this.props.skipLineup}
            navigator={this.props.navigator}
            descriptionNumberOfLines={8}
            // style={{
            // ...styleMargin(0, 0),
            // backgroundColor: 'green'
            // }}
            descriptionContainerStyle={{
                //    backgroundColor: 'white',
                borderRadius: 6,
                padding: 6,
                paddingRight: 18,
                paddingHorizontal: 10,
                marginLeft: 36,
                marginRight: 14,
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

    //sections[0].data[0][0]
    // list of sections, each section as its data: D
    // here D is an array !
    //sections: date > author > comments
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
            // groupedByAuthor = _.reverse(groupedByAuthor);
            authorGrouped.set(k, ...groupedByAuthor);
        });

        const sections = [];


        authorGrouped.forEachEntry((value, k) => {

            const dateStr = _.nth(_.nth(value, 0), 0).createdAt;
            const date = new Date(dateStr);
            let format = Date.now() - Date.parse(dateStr) < 7 * 24 * 60 * 60 * 1000 ? "%a %-H:%M" :  "%d/%m/%-y %-H:%M";

            sections.push({
                data: value,
                title: i18n.strftime(date, format),
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
    };
})();


const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case LOAD_COMMENTS.success(): {
                let {activityId, activityType, mergeOptions} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;

                state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
                break;
            }

        }
        return state;
    }
})();

let screen = CommentsScreen;

export {reducer, screen, actions};