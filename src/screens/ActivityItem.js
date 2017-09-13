import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import * as Model from "../model"
import i18n from '../i18n/i18n'

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
        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 20,
                marginBottom: 20
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
                            <Text style={{fontSize: 11}}>{Model.User.fullname(user)}</Text>
                            <Text style={{fontSize: 14}}>{`${target ? "in " + target.name : ''}`}</Text>
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

                    <Image
                        source={{uri: image}}
                        style={{
                            alignSelf: 'center',
                            height: 150,
                            width: "100%",
                        }}
                    />
                    <View style={{padding: 15}}>
                        <Text style={{fontSize: 20}}>{resource.title}</Text>
                        <Text style={{fontSize: 12, color: '#505050'}}>{resource.subtitle}</Text>
                    </View>

                    <View style={{width: "100%", height: StyleSheet.hairlineWidth, backgroundColor: "#505050"}}/>


                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>

                        {this.renderButton(require('../img/comment.png'), i18n.t("activity_item_buttons.comment"))}
                        {this.renderButton(require('../img/send.png'), i18n.t("activity_item_buttons.share"))}
                        {this.renderButton(require('../img/save-icon.png'), i18n.t("activity_item_buttons.save"))}
                        {this.renderButton(require('../img/buy-icon.png'), i18n.t("activity_item_buttons.buy"))}

                    </View>

                </View>

            </View>
        )
    }


    renderButton(img, text) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 6}}>
            <Image source={img} style={{margin: 8}}/>
            <Text style={{textAlign: 'center', fontSize: 10}}>{text}</Text>
        </View>;
    }

}
