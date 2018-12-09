// @flow
import React from 'react'
import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {renderSimpleButton, STYLES} from "../UIStyles"
import type {Id, Item, ItemType} from "../../types"
import {CREATE_SAVING, fetchItemCall} from "../lineup/actions"
import {logged} from "../../managers/CurrentUser"
import {connect} from "react-redux"
import {buildData} from "../../helpers/DataUtils"
import ItemCell from "../components/ItemCell"
import Screen from "../components/Screen"
import {safeDispatchAction} from "../../managers/Api"
import {FETCH_ITEM} from "../lineup/actionTypes"
import {Colors} from "../colors"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import Sheet from "../components/sheet"
import {CANCELABLE_MODAL} from "../Nav"
import _Messenger from "../../managers/Messenger"
import {SFP_TEXT_ITALIC, SFP_TEXT_REGULAR} from "../fonts"
import GTouchable from "../GTouchable"
import AddItemScreen2 from "./additem2"
import {openLinkSafely} from "../../managers/Links"

type Props = {
    defaultLineupId: Id,
    defaultDescription: Description,
    itemId: Id,
    itemType: ItemType,
    item?: Item,
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
export default class AddItemScreen extends Screen<Props, State> {

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
        return this.props.item || buildData(this.props.data, this.props.itemType, this.props.itemId)
    }

    componentDidAppear() {
        safeDispatchAction.call(
            this,
            this.props.dispatch,
            fetchItemCall(this.props.itemId).include('*').createActionDispatchee(FETCH_ITEM),
            'reqFetch'
        )
        if (this.textInput) {
            this.textInput.focus()
        }
    }

    _doAdd = (lineupId: Id, visibility: Visibility, description: string) => {


        const delayMs = 4000;

        this.props.dispatch(CREATE_SAVING.pending({
                itemId: this.props.itemId,
                itemType: this.props.itemType,
                lineupId,
                privacy: visibility,
                description,
            }, {
                scope: {itemId: this.props.itemId, lineupId},
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



