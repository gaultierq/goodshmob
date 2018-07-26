// @flow

import React, {Component} from 'react'
import {Colors} from "../../colors"
import SwitchSelector from 'react-native-switch-selector'
import {View} from "react-native"

type SocialScope = 'me' | 'friends' | 'all'

export type Pr = {
    onScopeChange: SocialScope => void,

};

type St = {}

export class SocialScopeSelector extends Component<Pr, St> {

    render() {

        const options = [
            {label: i18n.t("search.category.me"), type: 'me'},
            {label: i18n.t("search.category.friends"), type: 'friends'},
            {label: i18n.t("search.category.all"), type: 'all'},
        ]

        return (
            <View style={{padding: 12}}>
                <SwitchSelector
                    options={options.map((o,i) => ({...o, value: i}))}
                    onPress={position => this.props.onScopeChange(options[position].type)}
                    textColor={Colors.black}
                    selectedColor={Colors.white}
                    buttonColor={Colors.green}
                    borderColor={Colors.green}
                />
            </View>
        )

    }
}

