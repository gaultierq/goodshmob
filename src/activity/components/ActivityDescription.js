// @flow

import React from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import i18n from '../../i18n/i18n'
import * as UI from "../../screens/UIStyles";
import {buildNonNullData} from "../../utils/DataUtils";
import type {Activity, List, User} from "../../types";
import UserActivity from "./UserActivity";

type Props = {
    activity: Activity,
    navigator: any,
    withFollowButton?: boolean,
};

type State = {
};

export default class ActivityDescription extends React.Component<Props, State> {


    render() {
        let activity = this.getActivity();

        //let activity: Model.Activity = this.props.activity;
        let user: User = activity.user;
        let lineup: List = activity.target;

        let cardMargin = 12;
        let targetName;
        if (lineup) {
            let count = lineup.meta ? lineup.meta["savings-count"] : 0;
            targetName = lineup.name;
            if (count) targetName += " (" + count + ")"
        }
        return <View style={{margin: cardMargin, marginBottom: 8, backgroundColor: 'transparent'}}>


            <UserActivity
                activityTime={activity.createdAt}
                user={user}>

                {/* in Séries(1) */}
                {!!lineup &&
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{
                            fontSize: 9,
                            color: UI.Colors.grey1,
                            marginRight: 4
                        }}>{i18n.t("activity_item.header.in")}</Text>
                        <TouchableOpacity onPress={()=>this.seeList(lineup)}>
                            <Text
                                style={UI.TEXT_LIST}>
                                {targetName}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {
                        this.props.withFollowButton && this.renderFollowButton(lineup)
                    }

                </View>
                }
            </UserActivity>

            <Text style={{fontSize: 14}}>{activity.description}</Text>
        </View>;
    }

    seeList(lineup: List) {
        this.props.navigator.push({
            screen: 'goodsh.SavingsScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
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
