// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Dispatchee, Id, Item, ItemType, Url, User} from "../../types";
import {CheckBox} from "react-native-elements";
import _Messenger from "../../managers/Messenger"

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {currentUserId, logged} from "../../managers/CurrentUser"
import {connect} from "react-redux";
import {buildNonNullData} from "../../helpers/DataUtils";
import * as Nav from "../Nav";
import {Colors} from "../colors";
import GTouchable from "../GTouchable";
import Sheet from "../components/sheet";
import type { MapStateToProps } from "react-redux"


type Props = {
    navigator: any,
    containerStyle:? any,
    onClickClose: () => void,

    renderSharedObject: ()=>Node,

    //return the url to copy
    urlForClipboard?: () => Url,

    //for send screen
    sendAction?:(friend: User, description?: string) => Dispatchee,

    //return the intent for the share
    createShareIntent:? () => {content: any, options: any},
};

type State = {
};

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
    data: state.data,
})
@logged
@connect(mapStateToProps)
class ShareScreen extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    render() {
        const {
            sendAction,
            renderSharedObject,
            urlForClipboard,
            createShareIntent,
        } = this.props;

        return (
            <Sheet navigator={this.props.navigator}>
                <View style={{
                    justifyContent: 'center',
                    height: 375,
                    backgroundColor: 'rgba(255,255,255,1)',
                }}>
                    {renderSharedObject && renderSharedObject()}

                    <View style={{margin: 16, flexDirection: 'row', justifyContent: 'space-around'}}>
                        <GTouchable
                            style={styles.button}
                            onPress={()=>this.copyToClipboard()}
                            disabled={!urlForClipboard}
                        >
                            <Image source={require('../../img2/copyLink.png')}
                                   resizeMode="contain"
                                   style={styles.image}/>
                            <Text style={styles.buttonText}>{i18n.t("actions.copy_link")}</Text>
                        </GTouchable>
                        <GTouchable
                            style={styles.button}
                            onPress={()=>this.send()}
                            disabled={!sendAction}
                        >
                            <Image source={require('../../img2/sendToOther.png')}
                                   resizeMode="contain"
                                   style={styles.image}/>
                            <Text style={styles.buttonText}>{i18n.t("actions.send_to_goodsher")}</Text>
                        </GTouchable>
                        <GTouchable
                            style={styles.button}
                            onPress={()=>this.share()}
                            disabled={!createShareIntent}
                        >
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

    copyToClipboard() {
        const urlForClipboard = this.props.urlForClipboard;
        if (!urlForClipboard) return;
        Clipboard.setString(urlForClipboard());
        _Messenger.sendMessage(i18n.t('shared.link_copied'));
    }

    share() {
        const shareIntent = this.props.createShareIntent;
        if (!shareIntent) return;
        const {content, options} = shareIntent();
        Share.share(content, options)
    }

    send() {
        //const {item} = this.props;
        let navigator = this.props.navigator;
        navigator.showModal({
            screen: 'goodsh.SendScreen', // unique ID registered with Navigation.registerScreen
            title: i18n.t("actions.send"),
            navigatorButtons: Nav.CANCELABLE_MODAL,
            passProps: {
                userId: currentUserId(),
                sendAction: this.props.sendAction
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
