// @flow
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "../../colors";
import {stylePadding} from "../../UIStyles";
import {Avatar, renderTag} from "../../UIComponents";
import type {i18Key} from "../../../types";
import Octicons from "react-native-vector-icons/Octicons";
import {seeList} from "../../Nav";



function renderTags(activity, skipLineup) {
    let target, targetName: string, key: i18Key, press: () => void;
    if (!activity) return null;
    if (activity.type === 'asks') throw 'no ask';

    // const {skipLineup, withFollowButton} = this.props;
    // if (skipLineup) return null;


    if (!(target = activity.target)) return null;

    if (target.type === 'lists') {
        let count = target.meta ? target.meta["savingsCount"] : 0;
        targetName = target.name;
        if (count) targetName += " (" + count + ")";

        key = "activity_item.header.in";
        press = () => seeList(this.props.navigator, target);
    }
    else if (target.type === 'users') {
        // targetName = target.firstName + " " + target.lastName;
        // key = "activity_item.header.to";
        // press = () => seeUser(this.props.navigator, target);
        //new spec. todo clean
        return null;
    }
    if (!skipLineup) {
        return(
            <View style={styles.tag}>
                <Text style={{
                    textAlign: 'center',
                    marginRight: 8,
                    fontFamily: SFP_TEXT_MEDIUM,
                    fontsize: 12,
                    color: Colors.greyishBrown}}>{i18n.t(key)}</Text>
                {renderTag(targetName, press)}
            </View>
        )
    }
    else  return null;
}


export default ({activity, skipLineup}) => (
    <View>
        <View style={{flex: 1, flexDirection: 'row', ...stylePadding(0, 14)}}>
            <Avatar user={activity.user} style={{dim: 26, marginRight: 8, marginTop: 0}}/>
            <View style={{flex: 1, marginTop: 3}}>
                {!skipLineup && renderTags(activity)}
            </View>

        </View>

        <View style={{flex: 1, flexDirection: 'row',}}>
            {activity.description &&
            <Octicons name="quote" size={10} color={Colors.brownishGrey} style={{alignSelf: 'flex-start'}}/>}
            {activity.description && <Text numberOfLines={3} style={[styles.description, {
                flex: 1,
                alignItems: 'center',
                textAlignVertical: 'center', ...stylePadding(6, 0)
            }]}>{activity.description}</Text>}

        </View>
    </View>
);
