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

        let cardMargin = 15;
        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 20,
                marginBottom: 20
            }}>
                <View style={{marginLeft: cardMargin, marginRight: cardMargin}}>

                    <View style={{flex: 1, flexDirection: 'row', }}>
                        <Image
                            source={{uri: user.image}}
                            style={{
                                height: 30,
                                width: 30,
                                borderRadius: 15
                            }}
                        />
                        <View style={{ flex: 1, }}>
                            <Text>{Model.User.fullname(user)}</Text>
                            <Text>{`${target ? "in " + target.name : ''}`}</Text>
                        </View>

                    </View>

                    <Text>{activity.description}</Text>
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
                    <Text>{resource.title}</Text>
                    <Text>{resource.subtitle}</Text>
                    <View style={{width: "100%", height: 1, backgroundColor: "#000"}}/>


                    <View style={{flex: 1, flexDirection: 'row'}}>

                        {/*comment button*/}
                        <View style={{flex: 1}}>
                            <Image source={require('../img/close_circle.png')}/>
                            <Text>{"Donner son avis"}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Image source={require('../img/close_circle.png')}/>
                            <Text>{"Copier le lien"}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Image source={require('../img/close_circle.png')}/>
                            <Text>{"Enregistrer"}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Image source={require('../img/close_circle.png')}/>
                            <Text>{"Acheter"}</Text>
                        </View>

                    </View>

                </View>

            </View>
        )
    }
}
