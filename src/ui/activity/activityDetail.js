// @flow

import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as actions from './actions'
import {connect} from "react-redux";
import {currentUser, logged} from "../../managers/CurrentUser"
import ActivityBody from "./components/ActivityBody";
import {buildData, getAskBackgroundColor, sanitizeActivityType} from "../../helpers/DataUtils";
import {Avatar, MainBackground} from "../UIComponents";
import type {Activity, ActivityType, Id} from "../../types";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import ActivityStatus from "./components/ActivityStatus";
import {component as CommentInput, CREATE_COMMENT} from '../components/CommentInput';
import {userFirstName} from "../../helpers/StringUtils";
import CommentCell from "../components/CommentCell";
import {styleMargin, stylePadding} from "../UIStyles";
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM} from "../fonts";
import ActivityActionBar from "./components/ActivityActionBar";
import FeedSeparator from "./components/FeedSeparator";
import {mergeItemsAndPendings} from "../../helpers/ModelUtils";
import {CLOSE_MODAL} from "../Nav";

type Props = {
    activityId: Id,
    activityType: ActivityType,
    navigator: any,
};

type State = {
    isLoading?: boolean
};


@logged
@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
class ActivityDetailScreen extends Screen<Props, State> {

    state = {};

    static navigatorStyle = {
        drawUnderNavBar: true,
        navBarTransparent: true,
        navBarTranslucent: true,
        navBarBackgroundColor: Colors.dirtyWhite,
    };

    static navigatorButtons = {
        leftButtons: [
            {
                id: CLOSE_MODAL,
                icon: require('../../img2/circleBackArrow.png'),
                disableIconTint: true,
            }
        ],
        rightButtons: []
    };

    componentDidMount() {
        this.load();
    }

    load() {
        if (this.state.isLoading) return;
        this.setState({isLoading: true});
        this.props.dispatch(
            actions
                .fetchActivity(this.props.activityId, this.props.activityType)
        ).catch((err)=>console.log(err))
            .then(this.setState({isLoading: false}))
    }


    render() {
        let activity = this.makeActivity();

        let showLoader = !activity && this.state.isLoading;

        const isAsk = activity && sanitizeActivityType(activity.type) === 'asks';

        return (
            <MainBackground>
                <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
                    {showLoader && <ActivityIndicator
                        animating = {showLoader}
                        size = "large"
                        style={styles.loader}
                    />}
                    <View style={styles.container}>

                        { activity &&
                        <View>
                            <View>
                                {!isAsk &&
                                <GTouchable
                                    onPress={() => this.goBuy(activity)}
                                >
                                    <ActivityBody
                                        activity={activity}
                                        navigator={this.props.navigator}
                                        onPressItem={() => this.goBuy(activity)}
                                    />
                                </GTouchable>}
                                {isAsk &&
                                <View style={[styles.askContent, {backgroundColor: getAskBackgroundColor(activity)}]}>
                                    <Text style={[styles.askText]}>{activity.content}</Text>
                                </View>
                                }

                            </View>

                            <View style={{width: "100%"}}>
                                <ActivityActionBar
                                    activityId={activity.id}
                                    activityType={activity.type}
                                    navigator={this.props.navigator}
                                    blackList={['comment']}
                                />

                            </View>

                            <View style={{}}>
                                <FeedSeparator />
                                {
                                    this.renderActivityBlock(activity, {cardStyle: {paddingTop: 16}})
                                }
                            </View>


                            {!_.isEmpty(activity.relatedActivities) && <FlatList
                                data={activity.relatedActivities}
                                renderItem={({item}) => this.renderActivityBlock(
                                    item,
                                    {style: {...styleMargin(0, 0)}, cardStyle: {paddingTop: 8}}
                                )}
                                keyExtractor={(item, index) => item.id}
                                ItemSeparatorComponent={()=> <View style={{margin: 6}} />}
                                ListHeaderComponent={<Text style={{
                                    fontSize: 17,
                                    margin: 15,
                                    fontFamily: SFP_TEXT_MEDIUM
                                }}>{i18n.t('detail_screen.related_activities_title')}</Text>}

                            />
                            }
                        </View>
                        }
                    </View>
                </ScrollView>
                {/*<View style={styles.backButtonWrapper} >*/}
                {/*<BackButton onPress={() => {*/}
                {/*this.props.navigator.pop({*/}
                {/*animated: true, // does the pop have transition animation or does it happen immediately (optional)*/}
                {/*})*/}
                {/*}}/>*/}
                {/*</View>*/}
            </MainBackground>
        );
    }

    renderActivityBlock(activity, {style, cardStyle}) {
        const padding = 16;
        return <ActivityStatus
            activity={activity}
            skipLineup={this.props.skipLineup}
            navigator={this.props.navigator}
            style={[style]}
            cardStyle={[{
                // shadowColor: Colors.greyishBrown,
                // shadowOffset: {width: 0, height: 4},
                // shadowOpacity: 0.3,
                // shadowRadius: 1,
                elevation: 3,
                // marginBottom:5,
                paddingHorizontal: 16,
            }, cardStyle]}
        >
            <View style={{
                // ...styleMargin(12),
                ...stylePadding(padding, 0, padding, 12),
                backgroundColor: Colors.white,
                // ...styleBorder(StyleSheet.hairlineWidth, 0, StyleSheet.hairlineWidth, StyleSheet.hairlineWidth),
                // borderBottomLeftRadius: 4,
                // borderBottomRightRadius: 4,
                // borderColor: Colors.greyish
            }}>
                {this.renderActivityComments(activity)}
            </View>
        </ActivityStatus>;
    }

    goBuy(activity: Activity) {

        let url = _.get(activity, 'resource.location') || _.get(activity, 'resource.url');
        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    console.log("Don't know how to open URI: " + url);
                }
            });
        }
    }

    renderActivityComments(activity: Activity) {

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

        comments= _.take(comments, 4);

        let lastComment = _.head(comments);

        if (lastComment && !lastComment.built && !lastComment.pending) lastComment = null;

        let renderEmpty = () => {
            return (
                <View style={{flex: 1,
                    flexDirection: 'row',
                    paddingTop: 8,
                    alignItems: 'center',
                }
                }>
                    <CommentInput
                        activity={activity}
                        inputStyle={{fontSize: 13, }}
                        placeholder={"activity_screen.comments.no_comments"}
                    />
                </View>
            );
        };

        const jhop = (function *() {
            yield <FeedSeparator style={{marginTop: 8, marginBottom: 8}} />;
            return null;
        })();

        let separator = () => jhop.next().value;


        const noCommentators = _.isEmpty(activity.commentators);
        return (
            <GTouchable
                onPress={()=> this.displayActivityComments(activity)}>
                <View >

                    {/*empty*/}
                    {noCommentators && renderEmpty()}


                    {
                        lastComment && <View style={{paddingTop: 6}}>

                            {separator()}

                            <Text style={{fontSize: 12, fontFamily:SFP_TEXT_MEDIUM, color: Colors.black}}>
                                {i18n.t(
                                    'activity_screen.comments.has_commented',
                                    {
                                        first: userFirstName(lastComment.user),
                                        count: 0
                                    })}
                            </Text>

                            {/*comments bloc*/}
                            <View style={{marginTop: 8}}>
                                <CommentCell
                                    comment={lastComment} user={lastComment.user}
                                    textContainerStyle={{backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0,}}
                                />
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 8,
                                }}>

                                    {/*<Avatar user={currentUser()} style={{marginLeft: 0, dim: 22}}/>*/}

                                    <CommentInput
                                        activity={activity}
                                        containerStyle={{marginLeft: 30}}
                                        inputStyle={{fontSize: 13, }}
                                        placeholder={"activity_comments_screen.add_comment_placeholder"}
                                    />

                                </View>
                            </View>
                        </View>}

                    {
                        !_.isEmpty(activity.commentators) && <View>
                            {separator()}
                            {
                                this.renderOtherCommentators(_.slice(
                                    activity.commentators,
                                    lastComment ? 1 : 0,
                                    4), !!lastComment)
                            }
                        </View>
                    }
                </View>
            </GTouchable>);
    }

    renderOtherCommentators(othersCommentators, asWell: boolean = true) {
        return (
            <View style={{marginTop: 8}}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>

                    <Text style={{flex:1, fontSize: 12, alignItems: 'center', lineHeight: 22, color: Colors.greyishBrown, marginLeft: 0}}>
                        {__IS_IOS__ && this.renderMedals(othersCommentators)}
                        {i18n.t(
                            `activity_screen.comments.${asWell ? 'has_commented_this_as_well' : 'has_commented_this'}`,
                            {
                                first: userFirstName(_.nth(othersCommentators, 0)),
                                second: userFirstName(_.nth(othersCommentators, 1)),
                                count: othersCommentators.length - 1
                            }) + ". "
                        }
                        <Text style={{paddingLeft: 6, marginTop: 8, fontSize: 12, fontFamily: SFP_TEXT_BOLD, color: Colors.black}}>
                            {i18n.t('activity_screen.comments.see_theirs_comments', {count: othersCommentators.length})}
                        </Text>
                    </Text>

                </View>

            </View>
        );
    }

    renderMedals(othersCommentators) {
        const dim = 20;
        const shift = 0.5;
        const n = othersCommentators.length;
        const width  = dim + (dim * shift) * Math.max(n-1, 0) + 5;
        return <View style={{width, height: 18}}>
            {
                othersCommentators.map((user, i) => user && <Avatar user={user} style={{
                    dim: dim,
                    position: 'absolute',
                    left: dim * shift * i,
                    zIndex: (10 - i),
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: Colors.white
                }}/>)
            }
        </View>;
    }

    displayActivityComments(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: i18n.t('comments_screen.title'), // navigation bar title of the pushed screen (optional)
            passProps: {
                activityId: activity.id,
                activityType: activity.type
            },
        });
    }

    makeActivity() {
        return buildData(this.props.data, this.props.activityType, this.props.activityId);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        top: "50%",
        bottom: "50%",
    },
    backButtonWrapper: {
        position: 'absolute',
        left: 10,
        top: 20
    },
    askContent: {
        width: "100%",
        minHeight: 64,
        alignItems: 'center',
        justifyContent: 'center'
    },
    askText: {
        fontSize: 30,
        lineHeight: 35,
        color: Colors.white,
        textAlign: 'center',
        fontFamily: SFP_TEXT_BOLD,
        padding: 50
    },
});

let screen = ActivityDetailScreen;

export {screen};
