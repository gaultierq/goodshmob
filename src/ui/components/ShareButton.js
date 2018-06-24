// @flow

import React from 'react'
import {Share, StyleSheet, Text, View} from 'react-native'
import Button from 'apsl-react-native-button'
import {Colors} from "../colors"
import {SFP_TEXT_MEDIUM} from "../fonts"

type Props = {
    text?: string
};

export default class ShareButton extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <View>
                <Button
                    style={styles.button}
                    onPress={()=>this.share()}>
                    <Text style={styles.buttonText}>{this.props.text}</Text>
                </Button>
            </View>
        );
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

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.green,
        borderWidth: 0,
        borderRadius: 4,
        margin: 12,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 17,
        fontFamily: SFP_TEXT_MEDIUM,
        fontWeight: 'bold'
    }
});
