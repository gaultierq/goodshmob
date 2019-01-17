// @flow
import React, {Component} from 'react'
import {Clipboard, Dimensions, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {CheckBox} from "react-native-elements"
import {logged} from "../../managers/CurrentUser"
import type {MapStateToProps} from "react-redux"
import {connect} from "react-redux"
import {STYLES} from "../UIStyles"
import {Colors} from "../colors"
import type {Id, Lineup, RNNNavigator} from "../../types"
import i18n from "../../i18n"
import {CANCELABLE_MODAL} from "../Nav"
import GTouchable from "../GTouchable"
import {LINEUP_SELECTOR} from "../../helpers/Selectors"


@logged
@connect((state, props) => ({lineup: LINEUP_SELECTOR(props => props.lineupId)(state, props)}))
export default class LineupPicker extends
    Component<{
        navigator: RNNNavigator,
        lineupId: Id,
        lineup?: Lineup,
        onListSelected?: Lineup => void
    }, {}> {

    render() {
        const {lineup, onListSelected} = this.props

        const handler = () => {
            //select lineup
            this.props.navigator.showModal({
                screen: 'goodsh.AddInScreen',
                title: i18n.t('create_list_controller.choose_another_list'),
                passProps: {
                    onListSelected: list => {
                        onListSelected && onListSelected(list)
                        this.props.navigator.dismissModal()
                    }
                },
                navigatorButtons: CANCELABLE_MODAL,
            })
        }

        let tag = lineup && lineup.name;
        tag = tag || i18n.t('create_list_controller.choose_list');

        return (
            <GTouchable onPress={handler}>
                <View style={{height: 35, paddingLeft: 8, flexDirection: 'row'}}>
                    {/*{renderTag(lineup.name, handler, {position: 'absolute'})}*/}
                    <Text style={{marginRight: 5, marginTop: 2}}>{i18n.t('create_list_controller.add_to_list')} :</Text>

                    <Text style={[STYLES.tag]}>
                        {tag}{__IS_ANDROID__ && "  ▼"}
                        {__IS_IOS__ && <Text style={{color: Colors.brownishGrey, fontSize: 10, justifyContent: "flex-end", alignItems: "flex-end"}}>  ▼</Text>}
                    </Text>

                </View>
            </GTouchable>
        );
    }

}

