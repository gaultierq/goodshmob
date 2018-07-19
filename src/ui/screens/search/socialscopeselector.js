// @flow

import React, {Component} from 'react'
import MultiSwitch from "../../components/MultiSwitch"


type SocialScope = 'me' | 'friends' | 'all'

export type Pr = {
    onScopeChange: SocialScope => void
};

type St = {
};


export class SocialScopeSelector extends Component<Pr, St> {

    render() {

        const options = [
            {label: i18n.t("search.category.me"), type: 'me'},
            {label: i18n.t("search.category.friends"), type: 'friends'},
            {label: i18n.t("search.category.all"), type: 'all'},
        ]

        return (
            <MultiSwitch
                options={options}
                onPositionChange={(position: number) => {
                    this.props.onScopeChange(options[position].type)
                }}/>
        )

    }
}

