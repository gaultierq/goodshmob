// @flow

import React, {Component} from 'react'
import {Colors} from "../../colors"
import SwitchSelector from 'react-native-switch-selector'
import {View} from "react-native"
import {indexOfOr0} from "../../../helpers/ArrayUtil"

type SocialScope = 'me' | 'friends' | 'all'

export type Pr = {
    onScopeChange: SocialScope => void,
    initialValue?: string,

};

type St = {}

const options = [
    {label: i18n.t("search.category.me"), type: 'me'},
    {label: i18n.t("search.category.friends"), type: 'friends'},
    {label: i18n.t("search.category.all"), type: 'all'},
]

export class SocialScopeSelector extends Component<Pr, St> {

    render() {


        const initialValue = this.props.initialValue
        return (
            <View style={{padding: 12}}>
                <SwitchSelector
                    initial={indexOfOr0(options, el => el.type === this.props.initialValue)}
                    options={options.map((o,i) => ({...o, value: i}))}
                    onPress={position => this.props.onScopeChange(options[position].type)}
                    textColor={Colors.black}
                    selectedColor={Colors.white}
                    buttonColor={Colors.green}
                    borderColor={Colors.green}
                    sliderWidth={0}
                    value={this.index(this.props.value)}
                />
            </View>
        )

    }

    index(v) {
        if (!v) return null
        return indexOfOr0(options, el => el.type === v)
    }
}

