// @flow

import React, {Component} from 'react'
import {Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native'
import {CheckBox} from 'react-native-elements'
import {Navigation} from 'react-native-navigation'
import {Menu, MenuContext, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu'
import type {Visibility} from "../screens/additem"
import {LINEUP_CREATION} from '../lineup/actions'
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import {connect} from "react-redux"
import ModalTextInput from "./modalTextInput"
import {sendMessage} from "../../managers/Messenger"
import {buildData} from "../../helpers/DataUtils"
import normalize from 'json-api-normalizer'

type Props = {
    disableOffline?:boolean,
    onFinished?: Lineup => void,
    initialLineupName: string,
    navigator: any,
};

type State = {
    newLineupPrivacy?: Visibility,
};

@connect()
export default class AddLineupSheet extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };


    static defaultProps = {
        initialLineupName: '',
    };

    state = {};

    render() {
        const {initialLineupName, navigator} = this.props;


        return <ModalTextInput
            initialText={initialLineupName}
            navigator={navigator}
            requestAction={input=>this.createLineup(input)}
            placeholder={i18n.t("create_list_controller.placeholder")}
            numberOfLines={1}
            maxLength={50}
            height={500}
            title={i18n.t("create_list_controller.action")}
        />
    }

    createLineup(name: string) {
        let delayMs = 4000;
        if (this.props.disableOffline) {
            return this.props.dispatch(LINEUP_CREATION.exec({listName: name}))
                .then(rawLineup => {
                    let data = normalize(rawLineup);
                    let d = rawLineup.data
                    let lineup = buildData(data, d.type, d.id)

                    this.props.onFinished && this.props.onFinished(lineup);
                    sendMessage(i18n.t('create_list_controller.created'), {timeout: delayMs})

                });
        }
        else {
            return this.props.dispatch(LINEUP_CREATION.pending({listName: name}, {delayMs}))
                .then((pendingId)=> {
                    const onFinished = this.props.onFinished;
                    const lineup = {
                        id: pendingId,
                    }
                    onFinished && onFinished(lineup);

                    const action = this.props.disableOffline ? {} : {
                        title: i18n.t('actions.undo'),
                        onPress: () => {
                            this.props.dispatch(LINEUP_CREATION.undo(pendingId))
                        },
                    }

                    sendMessage(
                        i18n.t('create_list_controller.created'),
                        {
                            timeout: delayMs,
                            action
                        }
                    );

                });
        }
    }
}
