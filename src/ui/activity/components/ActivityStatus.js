// @flow
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "../../colors";
import {stylePadding, STYLES} from "../../UIStyles";
import {Avatar} from "../../UIComponents";
import type {Activity, i18Key, RNNNavigator} from "../../../types";
import Octicons from "react-native-vector-icons/Octicons";
import {seeList, seeUser} from "../../Nav";
import {SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import GTouchable from "../../GTouchable";
import {isSaving, isSending} from "../../../helpers/DataUtils";


const styles = StyleSheet.create({
    // body: {padding: 15, paddingBottom: 0, backgroundColor: ACTIVITY_CELL_BACKGROUND},
    // bodyInner: {flexDirection: 'row'},
    // flex1: {flex:1},
    // title: {fontSize: 19, color: Colors.black, marginBottom: 4, marginRight: 5},
    // subtitle: {fontSize: 14, color: Colors.greyish},
    description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    // imageContainer: {flex:1, alignSelf: 'center', width: "100%", backgroundColor: 'transparent'},
    // image: {alignSelf: 'center', backgroundColor: ACTIVITY_CELL_BACKGROUND, width: "100%"},
    // yheaaContainer: {position: 'absolute', width: "100%", height: "100%",backgroundColor: 'rgba(0,0,0,0.3)',alignItems: 'center',justifyContent: 'center'},
    tag: {flexDirection:'row', alignItems: 'center'},
    // askText: {margin: 12, fontSize: 30}
});

type Props = {
    activity: Activity,
    navigator: RNNNavigator,
    skipLineup?: boolean,
    style?: ?*
};

type State = {
};

export default class ActivityStatus extends React.Component<Props, State> {


    render() {
        const {activity, skipLineup, style} = this.props;

        return (
            <View style={style}>
                {isSaving(activity) && !skipLineup && this.renderSavedInList()}
                {isSending(activity) && this.renderSendTo()}

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
        )t
    }

    renderSendTo() {
        const {activity} = this.props;
        let target = activity.target;
        if (!activity) return null;

        //new spec. todo clean
        // return null;
        return(
            <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', ...stylePadding(0, 14)}}>
                <Avatar user={activity.user} style={{dim: 26, marginRight: 8, marginTop: 0}}/>
                <Text style={{
                    textAlign: 'center',
                    marginRight: 8,
                    fontFamily: SFP_TEXT_MEDIUM,
                    fontsize: 12,
                    color: Colors.greyishBrown}}>{i18n.t("activity_item.header.to")}</Text>
                <Avatar user={target} style={{dim: 26, marginRight: 8, marginTop: 0}}/>

            </View>


        )
    }

    renderSavedInList() {
        const {activity} = this.props;
        let target = activity.target;

        let count = target.meta ? target.meta["savingsCount"] : 0;
        let targetName = target.name;
        if (count) targetName += " (" + count + ")";

        return(

            <View style={{flex: 1, flexDirection: 'row', ...stylePadding(0, 14)}}>
                <Avatar user={activity.user} style={{dim: 26, marginRight: 8, marginTop: 0}}/>
                <View style={{flex: 1, marginTop: 3}}>
                    <View style={styles.tag}>
                        <Text style={{
                            textAlign: 'center',
                            marginRight: 8,
                            fontFamily: SFP_TEXT_MEDIUM,
                            fontsize: 12,
                            color: Colors.greyishBrown}}>{i18n.t("activity_item.header.in")}</Text>

                        <GTouchable onPress={() => seeList(this.props.navigator, target)}>
                            <Text style={[STYLES.tag]}>{targetName}</Text>
                        </GTouchable>
                    </View>
                </View>

            </View>

        )
    }



}

