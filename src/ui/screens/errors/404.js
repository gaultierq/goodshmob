// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {Button, Dimensions, Text, View} from 'react-native'

import {connect} from "react-redux"
import {Navigation} from 'react-native-navigation'
import {createSelector} from "reselect"
import {renderSimpleButton, STYLES} from "../../UIStyles"
import {logout} from "../../../auth/actions"

// $FlowFixMe
type Props = {
};

type State = {
};


@connect()
export default class Http404 extends Component<Props, State> {


    render() {

        return (
            <View style={STYLES.FULL_SCREEN}>
                <Text>{i18n.t('errors.unavailable')}</Text>
                {
                    renderSimpleButton(
                        i18n.t("actions.logout"),
                        () => logout(this.props.dispatch),
                        {
                            // loading: this.state.reqLogout === 'sending',
                            // style: {alignSelf: 'flex-start'},
                            // textStyle: styles.footerButton
                        }
                    )
                }
            </View>
        )
    }


}