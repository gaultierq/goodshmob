// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Id, Item, ItemType} from "../../types";
import {CheckBox} from "react-native-elements";
import Snackbar from "react-native-snackbar"

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {currentUserId} from "../../managers/CurrentUser"
import {connect} from "react-redux";
import {buildNonNullData} from "../../helpers/DataUtils";
import * as Nav from "../Nav";
import Closable from "./closable";
import {Colors} from "../colors";

type Props = {
    itemId: Id,
    itemType: ItemType,
    navigator: any,
    containerStyle:? any,
    onClickClose: () => void
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});


@connect(mapStateToProps)
class ShareScreen extends Component<Props, State> {

    render() {
        const {containerStyle, itemType, itemId, onClickClose} = this.props;
        const item = buildNonNullData(this.props.data, itemType, itemId);

        return (
            <Closable
                onClickClose={onClickClose}
                containerStyle={containerStyle}
            >

                <View style={{margin: 16}}>
                    <Image source={require('../../img/rounded_send_icon.png')}
                           resizeMode="contain"
                           style={{alignSelf: 'center',
                               width: 60,
                               height: 60,}}/>
                </View>
                <View style={{height: 300, margin: 16}}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={()=>this.copyToClipboard(item)}>
                        <Image source={require('../../img/link_icon.png')}
                               resizeMode="contain"
                               style={styles.image}/>
                        <Text style={styles.buttonText}>COPIER LE LIEN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={()=>this.send(item)}>
                        <Image source={require('../../img/network.png')}
                               resizeMode="contain"
                               style={styles.image}/>
                        <Text style={styles.buttonText}>ENVOYER À UN {"\n"}AUTRE {"\n"}GOODSHER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={()=>this.share(item)}>
                        <Image source={require('../../img/share_icon.png')}
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
            </Closable>
        );
    }
    renderIcon(iconName: string) {
        return <Icon key={iconName} name={iconName} color={Colors.green} size={16} style={styles.community} />;
    }

    copyToClipboard(item:Item) {
        Clipboard.setString(item.url);

        Snackbar.show({
            title: i18n.t('shared.link_copied'),
        });
    }

    share(item:Item) {
        const {title, subtitle, url} = item;

        let message = i18n.t('send_message', {what: title + '\n\n' + subtitle, url: i18n.t('goodsh_url')});
        message = message + " ";
        let intent = {
            message,
            title
        };
        if (url) intent = {...intent, url};

        Share.share(intent, {
            // Android only:
            dialogTitle: title,
            // iOS only:
            // excludedActivityTypes: [
            //     'com.apple.UIKit.activity.PostToTwitter'
            // ]
        })
    }

    send(item:Item) {
        //const {item} = this.props;
        let navigator = this.props.navigator;
        navigator.showModal({
            screen: 'goodsh.SendScreen', // unique ID registered with Navigation.registerScreen
            title: `#Envoyer '${item.title}'`,
            navigatorButtons: {
                leftButtons: [
                    {
                        id: Nav.CLOSE_MODAL,
                        title: "Cancel"
                    }
                ],
            },
            passProps: {
                userId: currentUserId(),
                itemId: item.id
            },
        });
    }

}



const styles = StyleSheet.create({
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


let screen = ShareScreen;

export {screen};
