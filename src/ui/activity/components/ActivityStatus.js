// @flow
import React from 'react'
import {Image, Linking, StyleSheet, Text, View} from 'react-native'
import {Colors} from "../../colors"
import {stylePadding} from "../../UIStyles"
import type {Activity, RNNNavigator} from "../../../types"
import {ViewStyle} from "../../../types"
import Octicons from "react-native-vector-icons/Octicons"
import {seeUser} from "../../Nav"
import {SFP_TEXT_ITALIC} from "../../fonts"
import GTouchable from "../../GTouchable"
import {sanitizeActivityType, timeSinceActivity} from "../../../helpers/DataUtils"
import {Avatar} from "../../UIComponents"
import {connect} from "react-redux"
import {getMainUrl, getActivityText, showResourceActions} from "../../ActivityHelper"

type Props = {
    activity: Activity,
    navigator: RNNNavigator,
    style?:*,
    cardStyle?: ViewStyle,
    descriptionContainerStyle?:*,
    descriptionStyle?: ViewStyle,
    children?:Node,
    descriptionNumberOfLines?: number,
    withMenu?: boolean
};

type State = {
};

@connect()
export default class ActivityStatus extends React.Component<Props, State> {

    static defaultProps = {
        descriptionNumberOfLines: 50
    };

    render() {
        const {activity, navigator, style, cardStyle, children} = this.props;

        //TODO: clear db from this type
        if (sanitizeActivityType(activity.type) === 'posts') return null

        let navP = this.getNavParams()
        let {content, textNode} = getActivityText(activity, navP);

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
                            <View style={{
                                flexDirection: 'row',
                                alignItems:'center',
                                flex: 1,
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    flex: 1,
                                }}>
                                    { textNode }
                                </View>
                                {
                                    this.props.withMenu && <GTouchable style={{
                                        // backgroundColor: 'red',
                                        alignSelf: 'flex-start',
                                        paddingHorizontal: 10,
                                        paddingVertical: 10,
                                    }} onPress={()=>{
                                        let u = getMainUrl(activity)
                                        showResourceActions(u, this.getNavParams())
                                    }}>
                                        <Image
                                            style={{tintColor: Colors.greyishBrown}}
                                            source={require("../../../img2/sidedots.png")} />
                                    </GTouchable>
                                }

                            </View>
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


    getNavParams() {
        const {navigator, dispatch} = this.props
        return {navigator, dispatch}
    }

}


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
        fontSize: 14,
        lineHeight: 22,
        fontFamily: SFP_TEXT_ITALIC,
        color: Colors.brownishGrey},
    userText: {
        fontSize: 13,
        lineHeight: 22,
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




