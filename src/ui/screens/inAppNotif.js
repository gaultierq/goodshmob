// @flow
import React from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import GTouchable from "../GTouchable"
import {Colors} from "../colors"
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "../fonts"
import type {Deeplink} from "../../types"
import NavManager from "../../managers/NavManager"
import {Navigation} from 'react-native-navigation'

type Props = {
    title: string,
    body?: string,
    deeplink?:Deeplink
};

type State = {
};

const PADDING = 10
const radius = 10
export default class InAppNotif extends React.Component<Props, State> {

    render() {
        const {title, body} = this.props;

        return (
            <View style={{
                // width: __DEVICE_WIDTH__,
                // height: 140,
                // backgroundColor: 'red',
                // marginTop: 64,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <GTouchable onPress={() => {
                    Navigation.dismissInAppNotification()
                    setTimeout(() => {
                        NavManager.goToDeeplink(this.props.deeplink)
                    }, 200)

                }} style={{
                    // backgroundColor: 'blue'
                }}>
                    <View style={{
                        width: __DEVICE_WIDTH__ - 2 * PADDING,
                        // flex: 1,
                        // marginTop: 58,
                        // height: 40,
                        // alignItems: 'center',
                        paddingVertical: 16,
                        ...Platform.select({
                            ios: {
                                paddingTop: 40,
                            },
                        }),
                        paddingHorizontal: 20,
                        backgroundColor: Colors.green,
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: radius,


                    }}>
                        <Text numberOfLines={1} style={{
                            fontSize: 19,
                            fontFamily: SFP_TEXT_MEDIUM,
                            textAlignVertical: 'center',
                            color: Colors.white,
                        }}>{title}</Text>
                        {!!body && <Text style={{
                            fontSize: 15,
                            fontFamily: SFP_TEXT_REGULAR,
                            textAlignVertical: 'center',
                            color: Colors.white,
                            marginTop: 10,
                        }}>{body}</Text>}
                        <Text style={{
                            fontSize: 20,
                            marginTop: 20,
                            alignSelf:'flex-end',
                            fontFamily: SFP_TEXT_BOLD,
                            textAlignVertical: 'center',
                            color: Colors.white,
                        }}>VOIR</Text>

                    </View>
                </GTouchable>
            </View>
        );
    }
}
