// @flow

import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as UI from "../../UIStyles";
import type {Activity, i18Key, List, User} from "../../../types";
import UserActivity from "./UserActivity";
import {fullName} from "../../../helpers/StringUtils";
import {Colors} from "../../colors";
import GTouchable from "../../GTouchable";
import {SFP_TEXT_ITALIC} from "../../fonts";

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
        let activity = this.props.activity;
        //let activity: Model.Activity = this.props.activity;
        let user: User = activity.user;

        let cardMargin = 12;


        return <View style={{backgroundColor: 'transparent'}}>


            <UserActivity
                activityTime={activity.createdAt}
                user={user}
                navigator={this.props.navigator}
            >

                {/* in Séries(1) */}
                {activity.type === 'asks' ? this.renderAsk() : this.renderTarget()}
            </UserActivity>

            {!!activity.description && <Text style={{fontSize: 13, paddingLeft: 38, paddingTop: 3, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey}}>{'"' + activity.description + '"'}</Text>}
        </View>;
    }

    renderAsk() {
        return <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Text
                style={{fontSize: 13}}>
                {i18n.t('activity_item.header.ask')}
            </Text>
        </View>
    }

    renderTarget() {
        const {skipLineup, withFollowButton} = this.props;
        if (skipLineup) return null;
        let activity, target, targetName: string, key: i18Key, press: () => void;
        if (!(activity = this.props.activity)) return null;
        if (!(target = activity.target)) return null;

        if (target.type === 'lists') {
            let count = target.meta ? target.meta["savingsCount"] : 0;
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
                    fontSize: 10,
                    color: Colors.greyishBrown,
                    marginRight: 3
                }}>{i18n.t(key)}</Text>
                <GTouchable onPress={press}>
                    <Text
                        style={[UI.TEXT_LIST, {fontSize: 10}]}>
                        {targetName}
                    </Text>
                </GTouchable>
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
            title: fullName(user),
            passProps: {
                userId: user.id,
            },
        });
    }

    renderFollowButton(target) {
        return target.primary ?
            <GTouchable>
                <Text style={{
                    fontSize: 9,
                    color: Colors.greyishBrown,
                    padding: 5,
                    borderRadius: 5,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: Colors.greyishBrown
                }}>{i18n.t("activity_item.buttons.unfollow_list")}</Text>
            </GTouchable>
            :
            <GTouchable
                style={{backgroundColor: "white", padding: 5, borderRadius: 5}}>
                <Text style={{
                    fontSize: 9,
                    color: Colors.blue
                }}>{i18n.t("activity_item.buttons.follow_list")}</Text>
            </GTouchable>;
    }
}
