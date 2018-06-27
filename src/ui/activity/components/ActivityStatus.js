// @flow
import React from 'react'
import {Image, Linking, StyleSheet, Text, View} from 'react-native'
import {Colors} from "../../colors"
import {stylePadding} from "../../UIStyles"
import type {Activity, Lineup, RNNNavigator, User} from "../../../types"
import {ViewStyle} from "../../../types"
import Octicons from "react-native-vector-icons/Octicons"
import {seeUser} from "../../Nav"
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts"
import GTouchable from "../../GTouchable"
import {isAsking, isSaving, isSending, timeSinceActivity} from "../../../helpers/DataUtils"
import {fullName, savingCount} from "../../../helpers/StringUtils"
import {Avatar} from "../../UIComponents"
import HTMLView from "react-native-htmlview/HTMLView"
import URL from "url-parse"
import NavManager from "../../../managers/NavManager"
import {connect} from "react-redux"
import Config from 'react-native-config'

type Props = {
    activity: Activity,
    navigator: RNNNavigator,
    skipLineup?: boolean,
    style?:*,
    cardStyle?: ViewStyle,
    descriptionContainerStyle?:*,
    descriptionStyle?: ViewStyle,
    children?:Node,
    descriptionNumberOfLines?: number
};

type State = {
};

@connect()
export default class ActivityStatus extends React.Component<Props, State> {

    static defaultProps = {
        descriptionNumberOfLines: 50
    };

    render() {
        const {activity, navigator, skipLineup, style, cardStyle, children} = this.props;

        let {content, textNode} = this.getParams(activity, skipLineup)();

        return (
            <View style={[styles.mainContainer, style]}>
                <View style={[{
                    backgroundColor: 'white',
                    padding: 6,
                }, cardStyle
                ]}>
                    <View style={{
                        flexDirection: 'row', flex: 1,
                        // backgroundColor: 'purple',
                    }}>
                        <GTouchable onPress={() => seeUser(navigator, activity.user)}>
                            <Avatar user={activity.user} />
                        </GTouchable>
                        <View style={{
                            // backgroundColor: 'red',
                            // alignItems: 'center',
                            justifyContent:'center',
                            flex: 1,
                            marginLeft: 8,
                        }}>
                            { textNode }
                            <Text style={[styles.userText, {alignSelf: 'flex-start', ...stylePadding(0, 3)}]}>{timeSinceActivity(activity)}</Text>
                        </View>
                    </View>

                    {
                        this.renderContent(content)
                    }
                </View>
                {children}

            </View>
        )
    }

    getParams(activity:Activity, skipLineup?: boolean): () => any {
        if (isSaving(activity) && !skipLineup) return this._renderSavedInList
        else if (isSending(activity)) return this._renderSendTo
        else if (isAsking(activity)) return this.renderAsk;
        else throw "christ"
    }

    renderContent(content: string) {
        if (!content) return null
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


    _renderSavedInList = () => {
        const {activity} = this.props;
        let target = activity.target;

        const user = activity.user;
        let textNode = (
            <HTMLView
                // renderNode={renderNode}
                onLinkLongPress={pressed => {
                    let url: URL
                    try {
                        url = new URL(pressed)
                        const q = url.query;
                        url.set('query', {... (q || {}), origin: 'long_press'})
                    }
                    catch (e) {
                        console.log("failed to parse url", e)
                    }
                    if (url) {
                        //this doesnt quite work as we need {navigator, dispatch}
                        //follow: https://github.com/wix/react-native-navigation/issues/3260

                        //Linking.openURL(url.toString())
                        const {navigator, dispatch} = this.props
                        NavManager.goToDeeplink(url, {navigator, dispatch})

                    }

                }
                }
                value={`<div>${i18n.t("activity_item.header.in",
                    {
                        adder: this.getUserHtml(user),
                        lineup: this.getLineupHtml(target),
                        what: this.getItemHtml(activity)
                    }
                )}</div>`}
                stylesheet={htmlStyles}
            />
        )

        return {
            textNode,
            content: activity.description
        };
    }

    getItemHtml(activity: Activity) {
        return `<i>${this.truncate(activity.resource.title)}</i>`;
    }

    truncate(string: string) {
        return _.truncate(string, {
            'length': 40,
            'separator': /,? +/
        });
    }

    _renderSendTo = () => {
        const {activity} = this.props;
        let target = activity.target;
        const user = activity.user;
        let textNode = <HTMLView
            // renderNode={renderNode}
            value={`<div>${i18n.t("activity_item.header.to",
                {
                    from: this.getUserHtml(user),
                    to: this.getUserHtml(target),
                    what: this.getItemHtml(activity)
                }
            )}</div>`}
            stylesheet={htmlStyles}
        />

        return {
            textNode,
            content: activity.description
        };
    }

    getUserHtml(user: User) {
        return `<a href="${Config.GOODSH_PROTOCOL_SCHEME}://it/users/${user.id}">${fullName(user)}</a>`;
    }

    getLineupHtml(lineup: Lineup) {
        return `<a href="${Config.GOODSH_PROTOCOL_SCHEME}://it/lists/${lineup.id}">${this.truncate(lineup.name)}</a> (${savingCount(lineup)})`;
    }


    renderAsk = () => {
        const {activity} = this.props;

        let textNode = <HTMLView
            // renderNode={renderNode}
            value={`<div>${i18n.t("activity_item.header.ask", {asker: this.getUserHtml(activity.user)})}</div>`}
            stylesheet={htmlStyles}
        />

        return {textNode, content: activity.content}
    }
}


const htmlStyles = StyleSheet.create({

    div: {
        fontFamily: SFP_TEXT_MEDIUM,
        fontSize: 14,
        color: Colors.greyishBrown
    },
    a: {
        fontFamily: SFP_TEXT_BOLD,
        fontSize: 16,
        color: Colors.black,
    },
    i: {
        fontFamily: SFP_TEXT_ITALIC,
        fontSize: 15,
        color: Colors.black
    },
})
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

