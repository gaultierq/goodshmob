// @flow

import React from 'react'
import {Share, StyleSheet, Text, View} from 'react-native'
import GButton from "./GButton"
import {LINEUP_PADDING} from "../UIStyles"

type Props = {
    text: string
}
type State = {
}

export default class ShareButton extends React.Component<Props, State> {

    render() {
        return (
            <GButton
                text={this.props.text}
                onPress={this.share.bind(this)}
                style={{margin: LINEUP_PADDING}}
            />
        )
    }

    share() {
        let message = i18n.t('share_goodsh.message');
        let title = i18n.t('share_goodsh.title');

        let intent = {
            message,
            title
        };

        Share.share(intent, {
            dialogTitle: title,
        });
    }
}
