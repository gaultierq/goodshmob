// @flow
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "../../colors";
import {stylePadding} from "../../UIStyles";
import type {Activity, RNNNavigator} from "../../../types";
import Octicons from "react-native-vector-icons/Octicons";
import {CANCELABLE_MODAL, seeList, seeUser} from "../../Nav";
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import GTouchable from "../../GTouchable";
import {isSaving, isSending, timeSinceActivity} from "../../../helpers/DataUtils";
import UserRowI from "./UserRowI";
import {userFirstName} from "../../../helpers/StringUtils";
import {currentUserId} from "../../../managers/CurrentUser";


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
        let renderMethod;
        if (isSaving(activity) && !skipLineup) {
            renderMethod = this.renderSavedInList.bind(this);
        }
        else if (isSending(activity)) {
            renderMethod = this.renderSendTo.bind(this);
        }


        let {rightText, rightHandler} = renderMethod && renderMethod() || {};
        return (
            <View style={[styles.descriptionContainer, style]}>
                <View style={[{
                    backgroundColor: 'white',
                    padding: 6,
                },cardStyle
                ]}>
                    <GTouchable onPress={rightHandler}>
                        <UserRowI
                            // activityTime={activity.createdAt}
                            user={activity.user}
                            navigator={this.props.navigator}
                            rightText={rightText}
                        >
                            <Text style={[styles.userText, {alignSelf: 'flex-start', ...stylePadding(0, 3)}]}>{timeSinceActivity(activity)}</Text>

                        </UserRowI>

                    </GTouchable>
                    {!!activity.description && this.renderDescription(activity)}
                </View>
                {children}

            </View>
        )
    }

    renderDescription(activity: Activity, children?: Node) {
        return (
            <GTouchable onPress={()=> {
                if (activity.user && activity.user.id === currentUserId()) {
                    //edit description
                    this.props.navigator.showModal({
                        screen: 'goodsh.ChangeDescriptionScreen',
                        animationType: 'none',
                        passProps: {
                            activityId: activity.id,
                            initialDescription: activity.description
                        }
                    });
                }
                else {
                    //open comments
                    this.props.navigator.showModal({
                        screen: 'goodsh.CommentsScreen',
                        title: i18n.t("activity_action_bar.comment.title"),
                        passProps: {
                            activityId: activity.id,
                            activityType: activity.type,
                            autoFocus: true
                        },
                        navigatorButtons: CANCELABLE_MODAL,
                    });
                }
            }}>
                <View style={[{
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
                        <Text numberOfLines={this.props.descriptionNumberOfLines} style={[styles.description, {
                            flex: 1,
                            alignItems: 'center',
                            textAlignVertical: 'center',
                            paddingHorizontal:2,
                        }]}>{_.upperFirst(activity.description)}
                        </Text>
                    </View>

                </View>
            </GTouchable>
        );
    }

    renderSendTo() {
        const {activity} = this.props;
        let target = activity.target;
        let rightText = (
            <Text style={{
                textAlign: 'center',
                marginRight: 8,
                fontFamily: SFP_TEXT_MEDIUM,
                fontSize: 12,
                color: Colors.greyishBrown}}>{" " +i18n.t("activity_item.header.to")}

                <Text style={{
                    fontFamily: SFP_TEXT_BOLD,
                    fontSize: 12,
                    color: Colors.black}}>{" "+userFirstName(target)}</Text>
            </Text>
        );
        let rightHandler = target && (() => seeUser(this.props.navigator, target));
        return {rightText, rightHandler};
    }

    renderSavedInList() {
        const {activity} = this.props;
        let target = activity.target;

        let count = target && target.meta ? target.meta["savingsCount"] : 0;
        let targetName = target && target.name;
        if (count) targetName += " (" + count + ")";

        let rightText = (
            <Text style={{
                textAlign: 'center',
                marginRight: 8,
                marginLeft: 6,
                fontFamily: SFP_TEXT_MEDIUM,
                fontSize: 12,
                color: Colors.greyishBrown}}>
                {" "} {i18n.t(!!target ? "activity_item.header.in" : "activity_item.header.added_somewhere")}

                {target && <Text style={[{
                    color: Colors.black,
                    fontFamily: SFP_TEXT_BOLD,
                    // fontSize: 12,
                    // lineHeight: 12

                }]}>{" " + targetName}</Text>
                }

            </Text>
        );

        return {rightText, rightHandler: target && (() => seeList(this.props.navigator, target))};
    }
}




