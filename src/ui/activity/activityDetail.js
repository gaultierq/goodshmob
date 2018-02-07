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
import {buildData} from "../../helpers/DataUtils";
import {Avatar, MainBackground} from "../UIComponents";
import ActivityDescription from "./components/ActivityDescription";
import type {Activity, ActivityType, Id} from "../../types";
import Icon from 'react-native-vector-icons/Entypo';
import Screen from "../components/Screen";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import ActivityStatus from "./components/ActivityStatus";
import {component as CommentInput} from '../components/CommentInput';
import {userFirstName} from "../../helpers/StringUtils";
import UserActivity from "./components/UserActivity";
import CommentCell from "../components/CommentCell";

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
}))
class ActivityDetailScreen extends Screen<Props, State> {

    state = {};

    /*
    static navigatorStyle = {
        drawUnderNavBar: true,
        navBarTransparent: true,
        navBarTranslucent: true,
        navBarBackgroundColor: Colors.dirtyWhite,
        // statusBarBlur: true
        // navBarButtonColor: 'transparent',
    };
    */

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

        return (
            <MainBackground>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    {showLoader && <ActivityIndicator
                        animating = {showLoader}
                        size = "large"
                        style={styles.loader}
                    />}
                    <View style={styles.container}>

                        { activity &&
                        <View>
                            <View>
                                <GTouchable
                                    onPress={() => this.goBuy(activity)}
                                >
                                    <ActivityBody
                                        activity={activity}
                                        navigator={this.props.navigator}
                                        onPressItem={() => this.goBuy(activity)}
                                    />
                                </GTouchable>

                            </View>

                            {/*<FeedSeparator/>*/}
                            <ActivityStatus
                                activity={activity}
                                skipLineup={this.props.skipLineup}
                                navigator={this.props.navigator}
                                style={{padding: 15}}
                            >
                                <View style={{padding: 15, backgroundColor: Colors.greying}}>
                                    {this.renderActivityComments(activity)}
                                </View>
                            </ActivityStatus>



                            <Text>Related Activities:</Text>
                            <FlatList
                                data={activity.relatedActivities}
                                renderItem={this.renderRelatedActivities.bind(this)}
                                keyExtractor={(item, index) => item.id}
                            />
                        </View>
                        }
                    </View>
                </ScrollView>
            </MainBackground>
        );
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

        let commentCount = _.get(activity, 'meta.commentsCount');
        let comments= _.take(activity.comments, 4);
        let commentators= _.take(activity.commentators, 4);
        let lastComment = _.head(comments);

        let renderEmpty = () => {
            return (
                <View style={{flex: 1,
                    flexDirection: 'row',
                    //justifyContent: 'space-between',
                    alignItems: 'center',
                }
                }>
                    <Text style={{fontSize: 11, color: Colors.greyish}}>{i18n.t("activity_screen.comments.no_comments")}</Text>
                    <Icon name="chevron-small-right" size={20} color={Colors.greyish} />
                </View>
            );
        };

        const noCommentators = _.isEmpty(activity.commentators);
        return (
            <GTouchable
                onPress={()=> this.displayActivityComments(activity)}>
                <View style={[{}]}>


                    {/*empty*/}
                    {noCommentators && renderEmpty()}

                    {!noCommentators && <View style={{flex: 1,
                        flexDirection: 'row',
                        //justifyContent: 'space-between',
                        alignItems: 'center',
                    }
                    }>
                        {_.take(activity.commentators, 4).map(user=> user && <Avatar user={user} style={{dim: 16}}/>)}
                        <Text>
                            {i18n.t(
                                'activity_screen.comments.has_commented',
                                {
                                    first: userFirstName(_.nth(activity.commentators, 0)),
                                    second: userFirstName(_.nth(activity.commentators, 1)),
                                    count: activity.commentators.length -1
                                })}
                        </Text>

                    </View>}
                    {/*comments bloc*/}
                    <View style={{padding: 10}}>
                        {commentCount > 1 && <Text style={{fontSize: 10, color: Colors.greyish}}>Voir les commentaires précédents</Text>}
                        {
                            lastComment && <CommentCell comment={lastComment} user={lastComment.user}/>
                        }
                        <View style={{flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Avatar user={currentUser()} style={{dim: 16}}/>
                            <CommentInput
                                activity={activity}
                                containerStyle={{backgroundColor: Colors.greying}}
                                inputContainerStyle={{borderRadius: 8, borderWidth: 0}}
                                inputStyle={{fontSize: 10, }}
                                height={25}
                                placeholder={"activity_comments_screen.add_comment_placeholder"}
                            />

                        </View>
                    </View>




                </View>
            </GTouchable>);
    }

    renderRelatedActivities({item}) {
        return (
            <View style={{backgroundColor: Colors.white, marginTop: 15, padding: 10, paddingLeft: 15, paddingRight: 15}}>
                <GTouchable onPress={()=> this.displayActivityComments(item)}>
                    <View>
                        <ActivityDescription activity={item} navigator={this.props.navigator}/>
                    </View>
                </GTouchable>
                <View style={{paddingLeft: 38, paddingTop: 5}}>
                    {this.renderActivityComments(item)}
                </View>
            </View>
        );
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
    }
});

let screen = ActivityDetailScreen;

export {screen};
