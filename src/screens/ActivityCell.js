import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import * as Model from "../model"
import i18n from '../i18n/i18n'
import * as TimeUtils from '../utils/TimeUtils'

export default class ActivityItem extends React.Component {
    _onPress = () => {
        this.props.onPressItem(this.props.activity.id);
    };

    render() {
        let activity: Model.Activity = this.props.activity;
        let user: Model.User = activity.user;
        let resource = activity.resource;
        let target: Model.List = activity.target;
        let image = resource ? resource.image : undefined;

        let cardMargin = 12;
        let targetName = target ? target.name : '';

        let likesCount = activity.meta ? activity.meta["likes-count"] : 0;
        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 10,
                marginBottom: 10
            }}>
                <View style={{margin: cardMargin, marginBottom: 8}}>

                    <View style={{flex: 1, flexDirection: 'row', marginBottom: 8}}>
                        <Image
                            source={{uri: user.image}}
                            style={{
                                height: 30,
                                width: 30,
                                borderRadius: 15
                            }}
                        />
                        <View style={{flex: 1, marginLeft: 8}}>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 12, color:'blue'}}>{Model.User.fullname(user)}</Text>
                                <Text style={{fontSize: 10, color:'#505050', marginLeft: 4}}>{TimeUtils.timeSince(Date.parse(activity.createdAt))}</Text>
                            </View>
                            { !!targetName &&
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 9, color:'#505050', marginRight: 4}}>{i18n.t("activity_item.header.in")}</Text>
                                <Text style={{fontSize: 14, color: 'blue'}}>{targetName}</Text>
                            </View>
                            }
                        </View>

                    </View>

                    <Text style={{fontSize: 14}}>{activity.description}</Text>
                </View>
                {/*card*/}
                <View style={{
                    backgroundColor: "white",
                    marginLeft: cardMargin,
                    marginRight: cardMargin,
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowOffset: {width: 2, height: 2},
                    shadowRadius: 2,
                }}>


                    <View style={{alignItems: 'center',}}>
                        <Image
                            source={{uri: image}}
                            style={{
                                alignSelf: 'center',
                                height: 150,
                                width: "100%",
                            }}
                        />

                        <View style={
                            {
                                backgroundColor: "white",
                                width: 60,
                                height: 30,
                                position: 'absolute',
                                bottom: -15,
                                borderRadius: 5,
                                padding: 2.5,

                            }
                        }>
                            <View style={
                                {
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 5,
                                    flex: 1, flexDirection: 'row', justifyContent: 'center',
                                    borderWidth: 0.5,
                                    borderColor: '#d6d7da',
                                    alignItems: 'center',
                                    padding: 2.5,
                                }
                            }>
                                <Image source={require('../img/mini-g-number.png')} resizeMode="contain"
                                       style={{
                                           width: 20,
                                           height: 20,
                                       }}
                                />
                                {!!likesCount && <Text style={{fontSize: 12, marginLeft: 3}}>{likesCount}</Text>}

                            </View>

                        </View>

                    </View>
                    <View style={{padding: 15}}>
                        <Text style={{fontSize: 20, fontFamily: 'Thonburi',}}>{resource.title}</Text>
                        <Text style={{fontSize: 12, color: '#505050'}}>{resource.subtitle}</Text>
                    </View>

                    <View style={{width: "100%", height: StyleSheet.hairlineWidth, backgroundColor: "#505050"}}/>


                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>

                        {this.renderButton(require('../img/comment.png'), i18n.t("activity_item.buttons.comment"))}
                        {this.renderButton(require('../img/send.png'), i18n.t("activity_item.buttons.share"))}
                        {this.renderButton(require('../img/save-icon.png'), i18n.t("activity_item.buttons.save"))}
                        {this.renderButton(require('../img/buy-icon.png'), i18n.t("activity_item.buttons.buy"))}

                    </View>

                </View>

            </View>
        )
    }

    timeSince() {

    }


    renderButton(img, text) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 6}}>
            <Image source={img} style={{margin: 8}}/>
            <Text style={{textAlign: 'center', fontSize: 10}}>{text}</Text>
        </View>;
    }

}
