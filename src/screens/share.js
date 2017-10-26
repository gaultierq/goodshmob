// @flow
import React, {Component} from 'react';
import {Clipboard, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import type {Id, Item, User} from "../types";
import {CheckBox} from "react-native-elements";
import Snackbar from "react-native-snackbar"
import i18n from '../i18n/i18n'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as UI from "./UIStyles";
import CurrentUser from "../CurrentUser"
import ApiAction from "../utils/ApiAction";
import type {Description, Visibility} from "./save";
import {connect} from "react-redux";

type Props = {
    item: Item,
    containerStyle: any
};

type State = {
};

@connect()
class ShareScreen extends Component<Props, State> {


    render() {
        const {containerStyle} = this.props;
        let s = "message";
        return (
            <View style={[styles.container, containerStyle]}>
                <View style={{margin: 16}}>
                    <Image source={require('../img/rounded_send_icon.png')}
                           resizeMode="contain"
                           style={{alignSelf: 'center',
                               width: 60,
                               height: 60,}}/>
                </View>
                <View style={{height: 300, margin: 16}}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.copyToClipboard.bind(this)}>
                        <Image source={require('../img/link_icon.png')}
                               resizeMode="contain"
                               style={styles.image}/>
                        <Text style={styles.buttonText}>COPIER LE LIEN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.send.bind(this)}>
                        <Image source={require('../img/network.png')}
                               resizeMode="contain"
                               style={styles.image}/>
                        <Text style={styles.buttonText}>ENVOYER À UN {"\n"}AUTRE {"\n"}GOODSHER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.share.bind(this)}>
                        <Image source={require('../img/share_icon.png')}
                               resizeMode="contain"
                               style={styles.image}/>
                        <View>
                            <Text style={styles.buttonText}>ENVOYER SUR</Text>
                            <View style={{flexDirection: 'row'}}>
                                {["message", "facebook-messenger", "email", "whatsapp", "dots-horizontal"]
                                    .map((s)=>this.renderIcon(s))
                                }

                            </View>
                        </View>

                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    renderIcon(iconName: string) {
        return <Icon name={iconName} color={UI.Colors.green} size={16} style={styles.community} />;
    }

    copyToClipboard() {
        const {item} = this.props;
        Clipboard.setString(item.url);

        Snackbar.show({
            title: i18n.t('shared.link_copied'),
        });
    }

    share() {
        const {item} = this.props;
        const {title, subtitle, url} = item;

        let intentMessage = 'Partager ' + title;
        Share.share({
            message: intentMessage + '\n' + subtitle,
            url: url,
            title: intentMessage
        }, {
            // Android only:
            dialogTitle: intentMessage,
            // iOS only:
            // excludedActivityTypes: [
            //     'com.apple.UIKit.activity.PostToTwitter'
            // ]
        })
    }

    send() {
        const {item} = this.props;
        let navigator = this.props.navigator;
        navigator.showModal({
            screen: 'goodsh.CommunityScreen', // unique ID registered with Navigation.registerScreen
            title: "Mes amis", // navigation bar title of the pushed screen (optional)
            passProps: {
                userId: CurrentUser.id,
                onPressItem: (user: User) => {

                    this.props.dispatch(actions.sendItem(item.id, user).disptachForAction2(actionTypes.SEND_ITEM))
                        .then((res)=> navigator.dismissModal());
                }
            },
        });
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        //margin: 20,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Chivo',
        color: 'black',
        fontSize: 15,

    },
    image: {
        alignSelf: 'center',
        width: 40,
        height: 40,
        marginRight: 14,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
    },
    community: {
        margin: 3,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
    }
});


const actionTypes = (() => {
    const SEND_ITEM = new ApiAction("send_item");

    return {SEND_ITEM};
})();


const actions = (() => {
    return {
        sendItem: (item: Item, user: User, description?: Description = "", privacy?: Visibility = 0) => {

            let body = {
                sending: {
                    receiver_id: user.id,
                    description,
                    privacy
                }
            };

            return new Api.Call().withMethod('POST')
                .withRoute(`items/${item.id}/sendings`)
                .withBody(body)
                .addQuery({
                    include: "*.*"
                });
        },
    };
})();

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {
        return state;
    }
})();



let screen = ShareScreen;

export {reducer, screen, actions};
