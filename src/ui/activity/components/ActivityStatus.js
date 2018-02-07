// @flow
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "../../colors";
import {styleMargin, stylePadding, STYLES} from "../../UIStyles";
import {Avatar} from "../../UIComponents";
import type {Activity, RNNNavigator} from "../../../types";
import Octicons from "react-native-vector-icons/Octicons";
import {seeList} from "../../Nav";
import {SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import GTouchable from "../../GTouchable";
import {isSaving, isSending, timeSinceActivity} from "../../../helpers/DataUtils";
import UserRowI from "./UserRowI";
import Triangle from "react-native-triangle";


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
    tag: {flex:1, flexDirection:'row', alignItems: 'center'},
    // askText: {margin: 12, fontSize: 30}



    descriptionContainer: {backgroundColor: 'transparent'},
    description: {fontSize: 13, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    // ask: {flex: 1, flexDirection: 'row', alignItems: 'center'},
    // askText: {fontSize: 13},
    // target: {flex: 1, flexDirection: 'row', alignItems: 'center'},
    // targetText: {fontSize: 10,color: Colors.greyishBrown,marginRight: 3},
    // unfollowText:{fontSize: 9, color: Colors.greyishBrown, padding: 5, borderRadius: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.greyishBrown},
    // followContainer: {backgroundColor: "white", padding: 5, borderRadius: 5},
    // followText: {fontSize: 9, color: Colors.blue}
    userText: {
        fontSize: 10,
        lineHeight: 10,
        color: Colors.greyish,
    },
    shadow: {
        shadowColor: Colors.greyishBrown,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 3,
    }
});

type Props = {
    activity: Activity,
    navigator: RNNNavigator,
    skipLineup?: boolean,
    style?: ?*,
    cardStyle?: ?*,
    children?: ?Node,

};

type State = {
};

export default class ActivityStatus extends React.Component<Props, State> {

    render() {
        const {activity, skipLineup, style, cardStyle, children} = this.props;
        let rightComponent;
        if (isSaving(activity) && !skipLineup) {
            rightComponent = this.renderSavedInList();
        }
        else if (isSending(activity)) {
            rightComponent = this.renderSendTo();
        }
        return (
            <View style={[styles.descriptionContainer, style]}>
                <View style={[{
                    backgroundColor: 'white',
                    padding: 6,
                },cardStyle
                ]}>
                    <UserRowI
                        // activityTime={activity.createdAt}
                        user={activity.user}
                        navigator={this.props.navigator}
                        rightComponent={rightComponent}
                    >
                        <Text style={[styles.userText, {alignSelf: 'flex-start', ...stylePadding(0, 0)}]}>{timeSinceActivity(activity)}</Text>

                    </UserRowI>

                    {activity.description && this.renderDescription(activity)}
                </View>
                {children}

            </View>
        )
    }

    renderDescription(activity: Activity, children?: Node) {
        return <View style={[{

            ...stylePadding(0, 6, 0, 0),

            // borderLeftWidth: StyleSheet.hairlineWidth,
            marginLeft: 2,


        }]}>
            <View style={[{
                flex: 1,
                flexDirection: 'row',
                backgroundColor: 'white',
                ...styleMargin(0, 0, 0, 0),
                ...stylePadding(10, 10),
                // borderRadius: 6,


            }]}>

                <Octicons name="quote" size={10} color={Colors.brownishGrey} style={{alignSelf: 'flex-start'}}/>
                <Text numberOfLines={3} style={[styles.description, {
                    flex: 1,
                    alignItems: 'center',
                    textAlignVertical: 'center', ...stylePadding(6, 0)
                }]}>{activity.description}
                </Text>
            </View>

            {/*{children}*/}


        </View>;
    }

    renderSendTo() {
        const {activity} = this.props;
        let target = activity.target;
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
            <View style={{flex: 1, marginLeft: 4, paddingBottom: 1, alignItems: 'baseline', flexDirection: 'row'}}>
                {/*<Avatar user={activity.user} style={{dim: 26, marginRight: 8, marginTop: 0}}/>*/}
                <View style={{flex: 1, }}>
                    <View style={styles.tag}>
                        <Text style={{
                            textAlign: 'center',
                            marginRight: 8,
                            // marginLeft: 6,
                            fontFamily: SFP_TEXT_MEDIUM,
                            fontSize: 12,
                            color: Colors.greyishBrown}}>{i18n.t("activity_item.header.in")}
                        </Text>

                        <GTouchable style={{}} onPress={() => seeList(this.props.navigator, target)}>
                            <Text style={[STYLES.tag2, {}]}>{targetName}</Text>
                        </GTouchable>
                    </View>
                </View>

            </View>

        )
    }
}




