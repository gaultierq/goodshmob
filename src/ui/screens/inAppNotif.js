// @flow
import React from 'react';
import {Text, View} from 'react-native';
import GTouchable from "../GTouchable";
import {Colors} from "../colors";
import {SFP_TEXT_MEDIUM} from "../fonts";
import type {Deeplink} from "../../types";
import NavManager from "../../managers/NavManager";

type Props = {
    text: string,
    deeplink: ?Deeplink
};

type State = {
};

export default class InAppNotif extends React.Component<Props, State> {

    render() {
        return (
            <View style={{
                width: __DEVICE_WIDTH__,
                height: 40,
                // backgroundColor: 'red',
                justifyContent: 'center'
            }}>
                <GTouchable onPress={() => {
                    if (NavManager.goToDeeplink(this.props.deeplink)) {
                        console.info('went to deeplink')
                        //TODO: dismiss inAppNotif
                    }
                }} style={{
                    // backgroundColor: 'blue'
                }}>
                    <View style={{
                        width: __DEVICE_WIDTH__,
                        // flex: 1,
                        // marginTop: 58,
                        // height: 40,
                        alignItems: 'center',
                        backgroundColor: Colors.green,

                    }}>
                        <Text numberOfLines={1} style={{
                            fontSize: 16,
                            fontFamily: SFP_TEXT_MEDIUM,
                            alignItems: 'center',
                            textAlignVertical: 'center',
                            paddingHorizontal: 20,
                            color: 'white'
                        }}>{this.props.text}</Text>
                    </View>
                </GTouchable>
            </View>
        );
    }

}

