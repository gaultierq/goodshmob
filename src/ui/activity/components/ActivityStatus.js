// @flow
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "../../colors";
import {stylePadding} from "../../UIStyles";
import type {Activity, RNNNavigator} from "../../../types";
import Octicons from "react-native-vector-icons/Octicons";
import {CANCELABLE_MODAL, seeComments, seeList, seeUser} from "../../Nav";
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import GTouchable from "../../GTouchable";
import {isAsking, isSaving, isSending, timeSinceActivity} from "../../../helpers/DataUtils";
import UserRowI from "./UserRowI";
import {userFirstName} from "../../../helpers/StringUtils";
import {currentUserId} from "../../../managers/CurrentUser";


const styles = StyleSheet.create({
    // description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    tag: {flex:1, flexDirection:'row', alignItems: 'center'},
    mainContainer: {backgroundColor: 'transparent'},
    descriptionContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 0,
        paddingTop: 10,
        marginLeft: 2,
    },
    description: {
        fontSize: 13, lineHeight: 18,
        fontFamily: SFP_TEXT_ITALIC,
        color: Colors.brownishGrey},
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
    descriptionContainerStyle?: ?*,
    descriptionStyle?: ?*,
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
        let content;
        let statusLineHandler;
        if (isSaving(activity) && !skipLineup) {
            renderMethod = this.renderSavedInList.bind(this);
            content = activity.description;
            statusLineHandler = () => this.statusLineHandler(activity)
        }
        else if (isSending(activity)) {
            renderMethod = this.renderSendTo.bind(this);
            content = activity.description;
            statusLineHandler = () => this.statusLineHandler(activity)
        }
        else if (isAsking(activity)) {
            renderMethod = this.renderAsk.bind(this);
            content = activity.content;
        }


        let {rightText, rightHandler} = renderMethod && renderMethod() || {};
        return (
            <View style={[styles.mainContainer, style]}>
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
                    {!!content && (
                        <GTouchable onPress={statusLineHandler}>
                            {this.renderDescription2(content)}
                        </GTouchable>
                    )}
                </View>
                {children}

            </View>
        )
    }

    statusLineHandler(activity) {
        if (activity.user && activity.user.id === currentUserId()) {
            //edit description
            this.props.navigator.showModal({
                screen: 'goodsh.ChangeDescriptionScreen',
                animationType: 'none',
                passProps: {
                    activityId: activity.id,
                    activityType: activity.type,
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
    }

    renderDescription2(content: string) {
        return <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={[styles.descriptionContainer, this.props.descriptionContainerStyle]}>

                <Octicons name="quote" size={10} color={Colors.brownishGrey} style={{alignSelf: 'flex-start'}}/>
                <Text numberOfLines={this.props.descriptionNumberOfLines} style={[
                    styles.description,
                    {
                        flex: 1,
                        alignItems: 'center',
                        textAlignVertical: 'center',
                        paddingHorizontal: 2,
                    },
                    this.props.descriptionStyle
                ]}>{_.upperFirst(content)}
                </Text>
            </View>
        </View>;
    }

    renderSendTo() {
        const {activity} = this.props;
        let target = activity.target;
        let rightText = this.renderStatusLine(
            i18n.t("activity_item.header.to"),
            userFirstName(target)
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

        let rightText = this.renderStatusLine(
            i18n.t(!!target ? "activity_item.header.in" : "activity_item.header.added_somewhere"),
            targetName
        );
        return {rightText, rightHandler: target && (() => seeList(this.props.navigator, target))};
    }

    renderAsk() {
        const {activity} = this.props;

        let rightText = this.renderStatusLine(
            i18n.t("activity_item.header.ask"),
        );
        return {rightText, rightHandler: (() => seeComments(this.props.navigator, activity))};
    }

    renderStatusLine(statusLine: string, statusTarget?: string) {

        return (
            <Text style={{
                textAlign: 'center',
                marginRight: 8,
                marginLeft: 6,
                fontFamily: SFP_TEXT_MEDIUM,
                fontSize: 12,
                color: Colors.greyishBrown}}>
                {" " + statusLine}

                {statusTarget && <Text style={[{
                    color: Colors.black,
                    fontFamily: SFP_TEXT_BOLD,
                }]}>{" " + statusTarget}</Text>
                }

            </Text>
        );

    }
}




