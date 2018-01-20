// @flow

import React from 'react';
import {ActivityIndicator, FlatList, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as actions from './actions'
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import ActivityBody from "./components/ActivityBody";
import {buildData} from "../../helpers/DataUtils";
import {MainBackground} from "../UIComponents";
import ActivityDescription from "./components/ActivityDescription";
import type {Activity, ActivityType, Id} from "../../types";
import * as UI from "../UIStyles";
import FeedSeparator from "./components/FeedSeparator";
import ActivityActionBar from "./components/ActivityActionBar";
import Icon from 'react-native-vector-icons/Entypo';
import UserRow from "./components/UserRow";
import Screen from "../components/Screen";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import * as TimeUtils from '../../helpers/TimeUtils';
import {SFP_TEXT_MEDIUM} from "../fonts";

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

                                <View style={{backgroundColor: 'white', paddingLeft: 15, paddingRight: 15}}>
                                    <UserRow
                                        user={activity.user}
                                        text={activity.createdAt ? TimeUtils.timeSince(Date.parse(activity.createdAt)):''}
                                        navigator={this.props.navigator}
                                    />
                                </View>

                                <FeedSeparator/>

                                <ActivityActionBar
                                    activityId={activity.id}
                                    activityType={activity.type}
                                    navigator={this.props.navigator}
                                    // actions={['answer', 'share', 'save', 'buy']}
                                />
                            </View>

                            <FeedSeparator/>


                            {this.renderComments(activity)}

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

    renderComments(activity) {
        return (
            <GTouchable
                onPress={()=> this.displayActivityComments(activity)}>
                <View style={[UI.CARD(0), {marginTop: 15, padding: 10, paddingLeft: 15, backgroundColor: "#fefefe"}]}>

                    {/*empty*/}
                    {_.isEmpty(activity.commentators) &&
                    <View style={{flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }
                    }>
                        <Text style={[UI.TEXT_LEAST_IMPORTANT, {marginLeft: 18}]}>{i18n.t("activity_screen.comments.no_comments")}</Text>
                        <Icon name="chevron-small-right" size={20} color={Colors.greyishBrown} />
                    </View>
                    }

                    {/*non empty*/}
                    {!_.isEmpty(activity.commentators) &&
                    <View>
                        <View><Text style={{fontSize: 16, fontFamily: SFP_TEXT_MEDIUM, color: Colors.greyish}}>{activity.comments.length + i18n.t('activity_screen.comments.x_comments')}</Text></View>
                        <View style={{flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }
                        }>
                            <UserRow
                                user={activity.commentators[0]}
                                text={"answered"}
                                small={true}
                                navigator={this.props.navigator}
                            />
                            <Icon name="chevron-small-right" size={20} color={Colors.greyishBrown} />
                        </View>
                    </View>
                    }



                </View>
            </GTouchable>);
    }

    renderRelatedActivities({item}) {
        return (<View>
                <GTouchable
                    // underlayColor={"red"}
                    onPress={()=> this.displayActivityComments(item)}
                >
                    <View>
                        <ActivityDescription activity={item} navigator={this.props.navigator}/>
                    </View>

                </GTouchable>

                {this.renderComments(item)}
            </View>
        );
    }

    displayActivityComments(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: "Commentaires", // navigation bar title of the pushed screen (optional)
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
