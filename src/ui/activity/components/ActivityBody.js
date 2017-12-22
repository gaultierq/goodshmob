// @flow
import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../UIStyles";
import {connect} from "react-redux";
import type {Activity} from "../../../types"
import {Colors} from "../../colors";
import ActionRights from "../../rights";
import Button from 'apsl-react-native-button';
import {fullName} from "../../../helpers/StringUtils";

type Props = {
    activity: Activity,
    onPressItem: (any) => void,
    noGoodshButton?: boolean
};

type State = {
};

@connect()
export default class ActivityBody extends React.Component<Props, State> {

    render() {
        const {activity, noGoodshButton} = this.props;
        let resource = activity.resource;

        let bgc = null;//{backgroundColor: activity.type === 'asks' ?  'red' : 'transparent'}
        return (
            <View>
                {/*Image And Button*/}
                <View style={[{alignItems: 'center', }, bgc]}>
                    {this.body()}

                    {/*{!noGoodshButton && activity.type !== 'asks' && <GoodshButton activity={activity}/>}*/}

                </View>

                {resource && (
                    <View style={{padding: 15, }}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex:1}}>
                                <Text style={{fontSize: 20, fontFamily: 'Chivo',}}>{resource.title}</Text>
                                <Text style={UI.TEXT_LESS_IMPORTANT}>{resource.subtitle}</Text>


                                {__IS_LOCAL__ &&
                                <Text style={UI.TEXT_LESS_IMPORTANT}>{activity.type + " " + activity.id}</Text>}
                            </View>
                            {this.renderBuyButton(activity)}
                        </View>
                        {!!activity.description && <Text style={{fontSize: 16, color: Colors.greyishBrown}}>{activity.description}</Text>}

                        {this.renderTags()}
                    </View>
                )

                }

            </View>
        )
    }


    renderTags() {
        let activity, target, targetName: string, key: i18Key, press: () => void;
        if (!(activity = this.props.activity)) return null;
        if (activity.type === 'asks') throw 'no ask';

        // const {skipLineup, withFollowButton} = this.props;
        // if (skipLineup) return null;


        if (!(target = activity.target)) return null;

        if (target.type === 'lists') {
            let count = target.meta ? target.meta["savings-count"] : 0;
            targetName = target.name;
            if (count) targetName += " (" + count + ")";

            key = "activity_item.header.in";
            press = () => this.seeList(target);
        }
        else if (target.type === 'users') {
            targetName = target.firstName + " " + target.lastName;
            key = "activity_item.header.to";
            press = () => this.seeUser(target);
        }

        const color = Colors.greyish;

        const pa = 16;
        return <View style={{flexDirection:'row', marginTop: 10}}>
            <TouchableOpacity onPress={press}>
                <Text
                    style={[{paddingLeft: pa, paddingRight: pa,
                        color,
                        alignSelf: 'stretch',
                        borderRadius: 13,
                        height: 26,
                        lineHeight: 26,
                        // padding: 2,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: color,

                    }]}>
                    {i18n.t(key) + ' ' + targetName}
                </Text>
            </TouchableOpacity>
        </View>

    }



    seeList(lineup: List) {
        this.props.navigator.push({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }

    seeUser(user: User) {
        this.props.navigator.push({
            screen: 'goodsh.UserScreen', // unique ID registered with Navigation.registerScreen
            title: fullName(user),
            passProps: {
                userId: user.id,
            },
        });
    }

    renderBuyButton(activity:Activity) {
        return new ActionRights(activity).canBuy() && <Button
            onPress={() => {
                this.execBuy(activity)
            }}
            style={[{height: 33, borderRadius: 4, backgroundColor: Colors.blue, borderWidth: 0}]}
        >
            <Text style={[UI.SIDE_MARGINS(10), {color: Colors.white, fontFamily: "Chivo", fontSize: 16}]}>
                #Buy
            </Text>
        </Button>;
    }


    execBuy(activity: Activity) {
        let url = _.get(activity, 'resource.url');
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    }

    body() {

        const {activity} = this.props;
        let resource = activity.resource;
        let image = resource ? resource.image : undefined;
        let imageHeight = 250;
        if (activity.type === 'asks'){

            let content = activity.content;
            if (__IS_LOCAL__) content += ` (id=${activity.id.substr(0, 5)})`;
            return <Text style={[{margin: 12, fontFamily: 'Chivo-Light', fontSize: 30}]}>{content}</Text>;
        }
        // image = null;
        return <View style={{
            flex:1,
            alignSelf: 'center',
            height: imageHeight + 15,
            width: "100%",
        }}>
            <Image
                source={image ? {uri: image} : require('../../../img/goodsh_placeholder.png')}
                resizeMode={image ? 'contain' : 'cover'}
                style={{
                    alignSelf: 'center',
                    height: imageHeight,
                    width: "100%",
                }}
                defaultSource={{}}
            />
        </View>
    }
}




