// @flow
import React, {Component} from 'react';
import {Clipboard, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import type {Item} from "../types";
import {CheckBox} from "react-native-elements";
import Snackbar from "react-native-snackbar"
import i18n from '../i18n/i18n'

type Props = {
    item: Item,
    containerStyle: any
};

type State = {
};

class ShareScreen extends Component<Props, State> {


    render() {
        const {containerStyle} = this.props;
        return (
            <View style={[styles.container, containerStyle]}>
                <View style={{flex: 1}}>
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
                        <Text style={styles.buttonText}>ENVOYER SUR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
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

    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20,
        backgroundColor: 'transparent',
        //alignItems: 'center',

    },
    buttonText: {
        fontFamily: 'Thonburi',
        color: 'black',
        fontSize: 18,
        marginLeft: 15
    },
    image: {
        alignSelf: 'center',
        width: 25,
        height: 25,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    }
});


const actionTypes = (() => {
    return {};
})();


const actions = (() => {
    return {

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
