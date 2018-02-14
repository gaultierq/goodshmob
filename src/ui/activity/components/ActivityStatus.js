// @flow
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "../../colors";
import {stylePadding} from "../../UIStyles";
import type {Activity, RNNNavigator} from "../../../types";
import Octicons from "react-native-vector-icons/Octicons";
import {seeList, seeUser} from "../../Nav";
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import GTouchable from "../../GTouchable";
import {isSaving, isSending, timeSinceActivity} from "../../../helpers/DataUtils";
import UserRowI from "./UserRowI";
import {userFirstName} from "../../../helpers/StringUtils";


const styles = StyleSheet.create({
    description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    tag: {flex:1, flexDirection:'row', alignItems: 'center'},
    descriptionContainer: {backgroundColor: 'transparent'},
    description: {fontSize: 13, lineHeight: 18, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
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
    descriptionNumberOfLines?: number

};

type State = {
};

export default class ActivityStatus extends React.Component<Props, State> {

    static defaultProps = {
        descriptionNumberOfLines: 50
    };

    render() {
        const {activity, skipLineup, style, cardStyle, children, navigator} = this.props;
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
                    <GTouchable onPress={() => seeUser(this.props.navigator, activity.user)}>
                        <UserRowI
                            // activityTime={activity.createdAt}
                            user={activity.user}
                            navigator={this.props.navigator}
                            rightComponent={rightComponent}
                        >
                            <Text style={[styles.userText, {alignSelf: 'flex-start', ...stylePadding(0, 3)}]}>{timeSinceActivity(activity)}</Text>

                        </UserRowI>

                    </GTouchable>
                    {activity.description && this.renderDescription(activity)}
                </View>
                {children}

            </View>
        )
    }

    renderDescription(activity: Activity, children?: Node) {
        return <View style={[{

            ...stylePadding(0, 0, 0, 0),

            // borderLeftWidth: StyleSheet.hairlineWidth,
            marginLeft: 2,


        }]}>
            <View style={[{
                flex: 1,
                flexDirection: 'row',
                backgroundColor: 'white',
                paddingHorizontal: 0,
                paddingTop: 10,
                // borderRadius: 6,
            }]}>

                <Octicons name="quote" size={10} color={Colors.brownishGrey} style={{alignSelf: 'flex-start'}}/>
                <Text numberOfLines={3} style={[styles.description, {
                    flex: 1,
                    alignItems: 'center',
                    textAlignVertical: 'center',
                    paddingHorizontal:2,
                }]}>{_.upperFirst(activity.description)}
                </Text>
            </View>

            {/*{children}*/}


        </View>;
    }

    renderSendTo() {
        const {activity} = this.props;
        let target = activity.target;
        return(
            <Text style={{
                textAlign: 'center',
                marginRight: 8,
                fontFamily: SFP_TEXT_MEDIUM,
                fontsize: 12,
                color: Colors.greyishBrown}}>{" " +i18n.t("activity_item.header.to")}

                <Text style={{
                    fontFamily: SFP_TEXT_BOLD,
                    fontsize: 12,
                    color: Colors.black}}>{" "+userFirstName(target)}</Text>
            </Text>



        )
    }

    renderSavedInList() {
        const {activity} = this.props;
        let target = activity.target;

        let count = target && target.meta ? target.meta["savingsCount"] : 0;
        let targetName = target && target.name;
        if (count) targetName += " (" + count + ")";

        return(
            <View style={{flex: 1, marginLeft: 4, paddingBottom: 1, alignItems: 'baseline', flexDirection: 'row'}}>
                {/*<Avatar user={activity.user} style={{dim: 26, marginRight: 8, marginTop: 0}}/>*/}
                <View style={{flex: 1, }}>
                    <View style={styles.tag}>

                        <GTouchable
                            disabled={!target}
                            style={{}} onPress={() => seeList(this.props.navigator, target)}>


                            <Text style={{
                                textAlign: 'center',
                                marginRight: 8,
                                // marginLeft: 6,
                                fontFamily: SFP_TEXT_MEDIUM,
                                fontSize: 12,
                                color: Colors.greyishBrown}}>
                                {i18n.t(!!target ? "activity_item.header.in" : "activity_item.header.added_somewhere")}

                                {target && <Text style={[{
                                    color: Colors.black,
                                    fontFamily: SFP_TEXT_BOLD,
                                    // fontSize: 12,
                                    // lineHeight: 12

                                }]}>{" " + targetName}</Text>
                                }

                            </Text>
                        </GTouchable>
                    </View>
                </View>

            </View>

        )
    }
}




