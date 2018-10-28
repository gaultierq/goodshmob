// @flow
import React from 'react'
import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import type {Id} from "../../types"
import {CREATE_ITEM_AND_SAVING, CREATE_SAVING} from "../lineup/actions"
import {logged} from "../../managers/CurrentUser"
import {connect} from "react-redux"
import Screen from "../components/Screen"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import _Messenger from "../../managers/Messenger"
import AddItemScreen2 from "./additem2"

type Props = {
    defaultLineupId: Id,
    defaultDescription: Description,
    item: IItem,
    onAdded: () => void,
    navigator: *,
    data: *
};

export type Description = string;
export type Visibility = 0 | 1;


type State = {
    reqAdd?: number,
    reqFetch?: number,
    selectedLineupId: Id,
};


@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
export default class CreateItemScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    render() {

        const {...attr} = this.props
        return (
            <AddItemScreen2 item={this.getItem()} doAdd={this._doAdd} {...attr} />
        )
    }

    getItem() {
        return this.props.item
    }

    _doAdd = (lineupId: Id, visibility: Visibility, description: string) => {


        // const delayMs = 4000;
        const delayMs = 10;

        this.props.dispatch(CREATE_ITEM_AND_SAVING.pending({
                item: this.getItem(),
                lineupId,
                privacy: visibility,
                description,
            }, {
                // scope: {itemId: this.props.item.uid, lineupId},
                lineupId: lineupId,
                delayMs: delayMs
            }
        )).then(pendingId => {

            let onAdded = this.props.onAdded;
            onAdded && onAdded();

            _Messenger.sendMessage(
                //MagicString
                i18n.t("shared.goodsh_saved"),
                {
                    timeout: delayMs,
                    action: {
                        title: i18n.t('activity_action_bar.goodsh_bookmarked_change_lineup'),
                        onPress: () => {
                            //undo previous add
                            console.info(`changing lineup: undo-ing pending=${pendingId}`);
                            this.props.dispatch(CREATE_SAVING.undo(pendingId));

                            let cancel = () => {
                                this.props.navigator.dismissModal()
                            };
                            this.props.navigator.showModal({
                                screen: 'goodsh.AddItemScreen',
                                title: i18n.t("add_item_screen.title"),
                                animationType: 'none',
                                passProps: {
                                    itemId: this.props.itemId,
                                    itemType: this.props.itemType,
                                    defaultLineupId: lineupId,
                                    defaultDescription: description,
                                    onCancel: cancel,
                                    onAdded: cancel,
                                },
                            });

                        },
                    }}
            );
        });
    }
}



