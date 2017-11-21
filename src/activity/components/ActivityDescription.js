// @flow

import React from 'react';
import {Image, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import i18n from '../../i18n/i18n'
import * as UI from "../../screens/UIStyles";
import {buildNonNullData} from "../../utils/DataUtils";
import type {Activity, i18Key, List, User} from "../../types";
import UserActivity from "./UserActivity";

type Props = {
    activity: Activity,
    navigator: any,
    withFollowButton?: boolean,
    skipLineup?: boolean
};

type State = {
};

export default class ActivityDescription extends React.Component<Props, State> {


    render() {
        let activity = this.getActivity();


        //let activity: Model.Activity = this.props.activity;
        let user: User = activity.user;

        let cardMargin = 12;


        return <View style={{margin: cardMargin, marginBottom: 8, backgroundColor: 'transparent'}}>


            <UserActivity
                activityTime={activity.createdAt}
                user={user}
                navigator={this.props.navigator}
            >

                {/* in Séries(1) */}
                {this.renderTarget()}
            </UserActivity>

            <Text style={{fontSize: 14}}>{activity.description}</Text>
        </View>;
    }

    renderTarget() {
        const {skipLineup, withFollowButton} = this.props;
        if (skipLineup) return null;
        let activity, target, targetName: string, key: i18Key, press: () => void;
        if (!(activity = this.getActivity())) return null;
        if (!(target = activity.target)) return null;

        if (target.type === 'lists') {
            let count = target.meta ? target.meta["savings-count"] : 0;
            targetName = target.name;
            if (count) targetName += " (" + count + ")"

            key = "activity_item.header.in";
            press = () => this.seeList(target);
        }
        else if (target.type === 'users') {
            targetName = target.firstName + " " + target.lastName;
            key = "activity_item.header.to";
            press = () => this.seeUser(target);
        }





        return <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{
                    fontSize: 9,
                    color: UI.Colors.grey1,
                    marginRight: 4
                }}>{i18n.t(key)}</Text>
                <TouchableOpacity onPress={press}>
                    <Text
                        style={UI.TEXT_LIST}>
                        {targetName}
                    </Text>
                </TouchableOpacity>
            </View>

            {
                withFollowButton && this.renderFollowButton(target)
            }

        </View>;
    }

    seeList(lineup: List) {
        this.props.navigator.push({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }

    seeUser(user: User) {
        this.props.navigator.push({
            screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                userId: user.id,
            },
        });
    }

    getActivity() {
        return this.props.activity || buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }

    renderFollowButton(target) {
        return target.primary ?
            <TouchableOpacity>
                <Text style={{
                    fontSize: 9,
                    fontFamily: 'Chivo',
                    color: UI.Colors.grey1,
                    padding: 5,
                    borderRadius: 5,
                    borderWidth: 0.5,
                    borderColor: UI.Colors.grey1
                }}>{i18n.t("activity_item.buttons.unfollow_list")}</Text>
            </TouchableOpacity>
            :
            <TouchableOpacity
                style={{backgroundColor: "white", padding: 5, borderRadius: 5}}>
                <Text style={{
                    fontSize: 9,
                    fontFamily: 'Chivo',
                    color: UI.Colors.blue
                }}>{i18n.t("activity_item.buttons.follow_list")}</Text>
            </TouchableOpacity>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
