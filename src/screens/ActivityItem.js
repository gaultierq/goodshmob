import React, {Component} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import * as Model from "../model"

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


        return (
            <View style={{
                marginBottom: 15,
                backgroundColor: "transparent"
            }}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Image
                        source={{uri: user.image}}
                        style={{
                            height: 30,
                            width: 30,
                            borderRadius: 15
                        }}
                    />
                    <View style={{  }}>
                        <Text>{Model.User.fullname(user)}</Text>
                        <Text>{`${target ? "in " + target.name : ''}`}</Text>
                    </View>

                </View>

                <Text>{activity.description}</Text>

                <View style={{
                    backgroundColor: "white"
                }}>

                    <Image
                        source={{uri: image}}
                        style={{
                            alignSelf: 'center',
                            height: 150,
                            width: "100%",
                        }}
                    />
                    <Text>{resource.title}</Text>
                    <Text>{resource.subtitle}</Text>

                </View>

            </View>
        )
    }
}
