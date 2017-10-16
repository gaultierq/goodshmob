// @flow

import React from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../../screens/UIStyles";
import {buildNonNullData} from "../../utils/DataUtils";
import type {Activity, List, User} from "../../types";

export default class ActivityDescription extends React.Component {

    props: {
        activity: Activity,
        activityId: number,
        activityType: string,
        withFollowButton: boolean
    };

    render() {
        let activity = this.getActivity();

        //let activity: Model.Activity = this.props.activity;
        let user: User = activity.user;
        let target: List = activity.target;

        let cardMargin = 12;
        let targetName;
        if (target) {
            let count = target.meta ? target.meta["savings-count"] : 0;
            targetName = target.name;
            if (count) targetName += " (" + count + ")"
        }

        return <View style={{margin: cardMargin, marginBottom: 8, backgroundColor: 'transparent'}}>

            <View style={{flex: 1, flexDirection: 'row', marginBottom: 8}}>
                <Image
                    source={{uri: user ? user.image: ""}}
                    style={{
                        height: 30,
                        width: 30,
                        borderRadius: 15
                    }}
                />
                <View style={{flex: 1, marginLeft: 8}}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity>
                            <Text style={{
                                fontSize: 11,
                                color: UI.Colors.blue
                            }}>{user ? Model.User.fullname(user):""}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity><Text style={{
                            fontSize: 9,
                            color: UI.Colors.grey1,
                            marginLeft: 4
                        }}>{activity.createdAt ? TimeUtils.timeSince(Date.parse(activity.createdAt)):''}</Text></TouchableOpacity>
                    </View>
                    {!!target &&
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{
                                fontSize: 9,
                                color: UI.Colors.grey1,
                                marginRight: 4
                            }}>{i18n.t("activity_item.header.in")}</Text>
                            <TouchableOpacity>
                                <Text
                                    style={{fontSize: 14, color: UI.Colors.blue}}>
                                    {targetName}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {
                            this.props.withFollowButton && this.renderFollowButton(target)
                        }


                    </View>
                    }
                </View>

            </View>

            <Text style={{fontSize: 14}}>{activity.description}</Text>
        </View>;
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
