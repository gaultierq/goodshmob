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
import GTouchable from "../GTouchable";
import Sheet from "../components/sheet";
import ItemCell from "../components/ItemCell";

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

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };


    render() {
        const {containerStyle, itemType, itemId, onClickClose} = this.props;
        const item = buildNonNullData(this.props.data, itemType, itemId);

        return (
            <Sheet navigator={this.props.navigator}>
                <View style={{
                    justifyContent: 'center',
                    height: 375,
                    backgroundColor: 'rgba(255,255,255,1)',
                }}>
                    <View style={{height: 100, }}>
                        <ItemCell item={item}/>
                    </View>

                    <View style={{margin: 16, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <GTouchable
                            style={styles.button}
                            onPress={()=>this.copyToClipboard(item)}>
                            <Image source={require('../../img2/copyLink.png')}
                                   resizeMode="contain"
                                   style={styles.image}/>
                            <Text style={styles.buttonText}>{i18n.t("actions.copy_link")}</Text>
                        </GTouchable>
                        <GTouchable
                            style={styles.button}
                            onPress={()=>this.send(item)}>
                            <Image source={require('../../img2/sendToOther.png')}
                                   resizeMode="contain"
                                   style={styles.image}/>
                            <Text style={styles.buttonText}>{i18n.t("actions.send_to_goodsher")}</Text>
                        </GTouchable>
                        <GTouchable
                            style={styles.button}
                            onPress={()=>this.share(item)}>
                            <Image source={require('../../img2/share.png')}
                                   resizeMode="contain"
                                   style={styles.image}/>
                            <View>
                                {/*<Text style={styles.buttonText}>#ENVOYER SUR</Text>*/}
                                <View style={{flexDirection: 'row', justifyContent: 'center', width: 70}}>
                                    {[/*"message", */"facebook-messenger", "email", "whatsapp"/*, "dots-horizontal"*/]
                                        .map((s)=>this.renderIcon(s))
                                    }

                                </View>
                            </View>

                        </GTouchable>
                    </View>
                    {/*</Closable>*/}
                </View>
            </Sheet>
        );
    }
    renderIcon(iconName: string) {
        return <Icon key={iconName} name={iconName} color={Colors.black} size={16} style={styles.community} />;
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
            title: i18n.t("actions.send") + '${item.title}',
            navigatorButtons: {
                leftButtons: [
                    {
                        id: Nav.CLOSE_MODAL,
                        title: i18n.t("actions.cancel")
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
        color: Colors.black,
        textAlign: 'center',
        width: 70,
        fontSize: 10,
    },
    image: {
        alignSelf: 'center',
        width: 68,
        height: 68,
    },
    button: {
        // flex: 1,
        // flexDirection: 'row',
        // alignItems: 'center',
        // height: 50,
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
