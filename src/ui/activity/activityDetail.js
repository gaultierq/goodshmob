// @flow

import React from 'react';
import {ActivityIndicator, FlatList, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import * as actions from './actions'
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import ActivityBody from "./components/ActivityBody";
import {buildData} from "../../helpers/DataUtils";
import {Avatar, MainBackground} from "../UIComponents";
import ActivityDescription from "./components/ActivityDescription";
import type {Activity, ActivityType, Id} from "../../types";
import * as UI from "../UIStyles";
import FeedSeparator from "./components/FeedSeparator";
import ActivityActionBar from "./components/ActivityActionBar";
import Icon from 'react-native-vector-icons/Entypo';
import IconFA from 'react-native-vector-icons/FontAwesome';
import UserRow from "./components/UserRow";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import * as TimeUtils from '../../helpers/TimeUtils';
import {SFP_TEXT_MEDIUM} from "../fonts";
import ActivityStatus from "./components/ActivityStatus";
import Triangle from 'react-native-triangle';

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
                                <View style={{marginTop: 15, padding: 15, }}>
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

    renderActivityComments(activity) {

        let commentCount = _.get(activity, 'meta.commentsCount');
        let comments= _.take(activity.comments, 4);
        let commentators= _.take(activity.commentators, 4);
        let lastComment = _.head(comments);


        return (
            <GTouchable
                onPress={()=> this.displayActivityComments(activity)}>
                <View style={[{}]}>


                    {/*empty*/}
                    {_.isEmpty(activity.commentators) &&
                    <View style={{flex: 1,
                        flexDirection: 'row',
                        //justifyContent: 'space-between',
                        alignItems: 'center',
                    }
                    }>
                        <Text style={{fontSize: 11, color: Colors.greyish}}>{i18n.t("activity_screen.comments.no_comments")}</Text>
                        <Icon name="chevron-small-right" size={20} color={Colors.greyish} />

                    </View>
                    }

                    <View style={{flex: 1,
                        flexDirection: 'row',
                        //justifyContent: 'space-between',
                        alignItems: 'center',
                    }
                    }>
                        {commentators.map(user=> user && <Avatar user={user} style={{dim: 14}}/>)}
                    </View>


                    <View>
                        <View style={{flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                        }
                        }>
                            {/*<Image source={require('../../img2/commentIcon.png')} style={{width: 18, height: 18, resizeMode: 'contain', tintColor: Colors.greyish}}/>*/}
                            {/*<Text style={{fontSize: 14, fontFamily: SFP_TEXT_MEDIUM, color: Colors.greyish, marginLeft: 6, marginRight: 6}}>{activity.comments.length}</Text>*/}
                            <UserRow
                                user={activity.commentators[0]}
                                text={i18n.t("activity_screen.comments.user_answered")}
                                small={true}
                                navigator={this.props.navigator}
                                noImage={true}
                            />
                            <Icon name="chevron-small-right" size={20} color={Colors.greyish} />
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
